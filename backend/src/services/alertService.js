const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// ── Email Transport (Gmail SMTP) ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // SSL for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ── Firebase Admin ───────────────────────────────────────────────────────────
let firebaseAdmin = null;
try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    firebaseAdmin = admin;
} catch (err) {
    logger.warn('Firebase Admin not configured — push notifications disabled');
}

// ── Severity → Color Map ─────────────────────────────────────────────────────
const SEVERITY_EMOJI = { LOW: '🟡', MEDIUM: '🟠', HIGH: '🔴', CRITICAL: '🚨' };

/**
 * Auto-triggered when riskScore >= threshold after a prediction.
 */
exports.triggerAutoAlert = async (prediction, ward) => {
    const severity = prediction.riskScore >= 0.9 ? 'CRITICAL'
        : prediction.riskScore >= 0.8 ? 'HIGH'
            : prediction.riskScore >= 0.7 ? 'MEDIUM' : 'LOW';

    const reasons = Array.isArray(prediction.outbreakReasons)
        ? prediction.outbreakReasons.join('\n• ')
        : '';

    const message = `${SEVERITY_EMOJI[severity]} ${severity} outbreak risk detected in ${ward.name}, ${ward.city}.\n\nCategory: ${prediction.outbreakCategory}\nRisk Score: ${(prediction.riskScore * 100).toFixed(0)}%\nConfidence: ${(prediction.confidence * 100).toFixed(0)}%\n\nKey Signals:\n• ${reasons}`;

    const alert = await prisma.alert.create({
        data: {
            wardId: ward.id,
            predictionId: prediction.id,
            severity,
            outbreakCategory: prediction.outbreakCategory,
            message,
            recommendedAction: getRecommendedAction(prediction.outbreakCategory, severity),
            recipientType: 'ALL',
        },
    });

    await exports.dispatch(alert);
    return alert;
};

/**
 * Dispatches an alert via email + push notifications.
 */
exports.dispatch = async (alert) => {
    try {
        await Promise.allSettled([
            sendEmail(alert),
            sendPushNotification(alert),
        ]);

        await prisma.alert.update({
            where: { id: alert.id },
            data: { status: 'SENT', sentAt: new Date() },
        });
        logger.info(`Alert dispatched: ${alert.id} | ${alert.severity}`);
    } catch (err) {
        logger.error(`Alert dispatch failed: ${err.message}`);
        await prisma.alert.update({
            where: { id: alert.id },
            data: { status: 'FAILED' },
        });
    }
};

// ── Email ────────────────────────────────────────────────────────────────────

async function sendEmail(alert) {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid not configured — skipping email');
        return;
    }

    // Get GOV + HOSPITAL user emails
    const users = await prisma.user.findMany({
        where: { role: { in: ['GOV', 'HOSPITAL'] } },
        select: { email: true },
    });

    if (!users.length) return;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin:0">⚠️ Kavach Disease Outbreak Alert</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; white-space: pre-line;">${alert.message}</p>
        ${alert.recommendedAction ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 16px;">
          <strong>Recommended Action:</strong><br>${alert.recommendedAction}
        </div>` : ''}
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Sent by Kavach AI Outbreak Monitoring System • ${new Date().toISOString()}
        </p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || 'alerts@kavach.health',
        to: users.map((u) => u.email).join(','),
        subject: `[Kavach] ${alert.severity} Alert — ${alert.outbreakCategory} Risk`,
        html,
    });
}

// ── Push Notifications ───────────────────────────────────────────────────────

async function sendPushNotification(alert) {
    if (!firebaseAdmin) return;

    // Get FCM tokens of citizens in the affected ward
    const users = await prisma.user.findMany({
        where: { wardId: alert.wardId, fcmToken: { not: null } },
        select: { fcmToken: true },
    });

    if (!users.length) return;

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    const message = {
        notification: {
            title: `⚠️ ${alert.severity} Health Alert`,
            body: `${alert.outbreakCategory} risk detected in your area. Stay alert.`,
        },
        data: {
            alertId: alert.id,
            wardId: alert.wardId,
            severity: alert.severity,
            category: alert.outbreakCategory,
        },
        tokens,
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    logger.info(`Push sent: ${response.successCount}/${tokens.length} delivered`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRecommendedAction(category, severity) {
    const actions = {
        WATERBORNE: 'Boil water before use. Avoid tap water for drinking. Report to local water authority.',
        FOODBORNE: 'Avoid street food. Wash hands thoroughly. Seek medical attention if symptomatic.',
        AIRBORNE: 'Wear N95 masks in crowded areas. Ensure good ventilation. Avoid crowded spaces.',
        VECTOR_BORNE: 'Use mosquito repellent. Eliminate standing water. Wear full-sleeve clothing.',
        HOSPITAL_ACQUIRED: 'Enforce strict hand hygiene protocols. Isolate affected wards. Alert infection control team.',
        UNKNOWN: 'Monitor symptoms. Seek medical attention if condition worsens.',
    };
    return actions[category] || actions.UNKNOWN;
}
