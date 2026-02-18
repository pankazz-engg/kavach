const { z } = require('zod');

// ─── Auth ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['GOV', 'HOSPITAL', 'CITIZEN']),
    name: z.string().min(1).optional(),
    wardId: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// ─── Hospital Admission ────────────────────────────────────────────────────

const hospitalAdmissionSchema = z.object({
    wardId: z.string().min(1),
    hospitalName: z.string().min(1),
    reportDate: z.string().datetime(),
    syndromeType: z.enum([
        'DIARRHEA', 'FEVER', 'VOMITING', 'COUGH',
        'RESPIRATORY_DISTRESS', 'SKIN_RASH', 'JAUNDICE', 'HEADACHE', 'UNKNOWN',
    ]),
    admissionCount: z.number().int().min(0),
    severeCount: z.number().int().min(0).default(0),
    deathCount: z.number().int().min(0).default(0),
    ageGroup: z.enum(['0-5', '6-18', '19-60', '60+']).optional(),
});

// ─── Water Quality ─────────────────────────────────────────────────────────

const waterQualitySchema = z.object({
    wardId: z.string().min(1),
    reportDate: z.string().datetime(),
    chlorineLevel: z.number().min(0).max(10),
    phLevel: z.number().min(0).max(14),
    turbidity: z.number().min(0),
    ecoli: z.number().min(0).optional(),
    totalColiforms: z.number().min(0).optional(),
    source: z.enum(['TAP', 'BOREWELL', 'RIVER', 'LAKE', 'OTHER']).optional(),
});

// ─── Weather ───────────────────────────────────────────────────────────────

const weatherSchema = z.object({
    wardId: z.string().min(1),
    recordedAt: z.string().datetime(),
    rainfall: z.number().min(0),
    temperature: z.number().min(-50).max(60),
    humidity: z.number().min(0).max(100),
    windSpeed: z.number().min(0).optional(),
    uvIndex: z.number().min(0).optional(),
});

// ─── Citizen Report ────────────────────────────────────────────────────────

const citizenReportSchema = z.object({
    wardId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    syndromeType: z.enum([
        'DIARRHEA', 'FEVER', 'VOMITING', 'COUGH',
        'RESPIRATORY_DISTRESS', 'SKIN_RASH', 'JAUNDICE', 'HEADACHE', 'UNKNOWN',
    ]),
    description: z.string().max(500).optional(),
    severity: z.number().int().min(1).max(5).default(1),
});

// ─── Risk Prediction Request ───────────────────────────────────────────────

const riskPredictSchema = z.object({
    wardId: z.string().min(1),
    forecastHorizon: z.number().int().min(1).max(168).default(48), // hours
});

// ─── Alert ─────────────────────────────────────────────────────────────────

const alertSchema = z.object({
    wardId: z.string().min(1),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    outbreakCategory: z.enum([
        'WATERBORNE', 'FOODBORNE', 'AIRBORNE', 'VECTOR_BORNE', 'HOSPITAL_ACQUIRED', 'UNKNOWN',
    ]),
    message: z.string().min(1).max(1000),
    recommendedAction: z.string().max(500).optional(),
    recipientType: z.enum(['GOV', 'HOSPITAL', 'CITIZEN', 'ALL']),
});

// ─── Ward ──────────────────────────────────────────────────────────────────

const wardSchema = z.object({
    name: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    population: z.number().int().min(0).optional(),
});

// ─── Validation Middleware Factory ─────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: result.error.flatten().fieldErrors,
        });
    }
    req.body = result.data; // use parsed + defaulted data
    next();
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    hospitalAdmissionSchema,
    waterQualitySchema,
    weatherSchema,
    citizenReportSchema,
    riskPredictSchema,
    alertSchema,
    wardSchema,
};
