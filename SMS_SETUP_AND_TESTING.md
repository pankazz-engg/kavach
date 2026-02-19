# SMS High-Risk Alert Notification Setup & Testing Guide

## ✅ Changes Made

### Backend Code Changes

1. **Added Phone Field to User Model** (`backend/src/models/index.js`)
   - Added `phone: { type: String }` field to userSchema
   - Added phone index for query performance

2. **Updated Prisma Schema** (`backend/prisma/schema.prisma`)
   - Added optional `phone: String?` field to User model
   - Added `@@index([phone])` for database optimization

3. **Updated Registration Endpoint** (`backend/src/controllers/authController.js`)
   - Extract `phone` from registration request body
   - Store phone number in user document
   - Include phone in safeUser response object

4. **Added Phone Validation** (`backend/src/validation/schemas.js`)
   - Added phone field validation to `registerSchema`
   - Added phone field validation to `createUserSchema`
   - Validates E.164 format: `+[1-9]\d{1,14}` (e.g., +919876543210)

5. **Fixed SMS Alert Integration** (`backend/src/services/alertService.js`)
   - Updated `sendSMSNotification()` to filter by CITIZEN and HOSPITAL roles
   - Enhanced SMS message format with outbreak type, severity, and recommended action
   - Proper error handling and logging

6. **Updated Environment Config** (`backend/.env.example`)
   - Added Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE)

### Frontend Changes

1. **Updated Signup Form** (`frontend/pages/signup.js`)
   - Added Phone icon import from lucide-react
   - Added phone field to form state
   - Added phone input field in registration form (optional)
   - Added phone to registration API payload
   - Added helper text for E.164 format

---

## 🔧 Setup Instructions

### 1. Get Twilio Credentials

1. Sign up at https://www.twilio.com/
2. Go to Twilio Console (https://console.twilio.com/)
3. Get your credentials:
   - **Account SID**: Found in Twilio Console dashboard
   - **Auth Token**: Found in Twilio Console dashboard
   - **Phone Number**: Buy a phone number or use a sandbox number for testing

### 2. Update Backend Environment

In `backend/.env`, add:

```bash
TWILIO_ACCOUNT_SID=your_account_sid_from_twilio
TWILIO_AUTH_TOKEN=your_auth_token_from_twilio
TWILIO_PHONE=+1234567890  # Your Twilio phone number (E.164 format)
```

### 3. Install Dependencies

Verify the twilio package is installed in backend:

```bash
cd Kavach/backend
npm install
# twilio package should already be in package.json (version 5.12.2)
```

### 4. Database Migration (Optional)

If using MongoDB directly, the phone field will be automatically added on first use.

If you want to run Prisma migrations:

```bash
cd Kavach/backend
npx prisma migrate dev --name add_phone_field
```

---

## 📱 Testing SMS Notifications

### Test 1: User Registration with Phone

**Step 1**: Register a new user

- Go to frontend signup: http://localhost:3000/signup
- Fill in the form:
  ```
  Name: Test User
  Email: testuser@example.com
  Phone: +919876543210 (or your test phone number)
  Ward ID: (leave empty or use a valid ward ID)
  Password: TestPassword123
  ```
- Click "Create Account"

**Step 2**: Verify phone is stored

- Check database (MongoDB):
  ```bash
  db.users.findOne({ email: "testuser@example.com" })
  ```
- Should see: `"phone": "+919876543210"`

### Test 2: SMS Alert Triggered on High-Risk Prediction

**Step 3**: Trigger a high-risk prediction

Option A - Manual API call:
```bash
curl -X POST http://localhost:5000/api/risk/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wardId": "WARD_ID_FROM_TEST_USER",
    "forecastHorizon": 48
  }'
```

Option B - Use admin dashboard
- Log in as GOV/HOSPITAL user
- Navigate to the ward where you registered the test user
- Click "Run 48h Prediction"

**Step 4**: Monitor SMS dispatch

- Check backend logs for SMS send confirmation:
  ```
  SMS sent to X users for alert ABC123
  ```

**Step 5**: Verify SMS received

- Check your test phone number for the SMS message
- Expected format:
  ```
  🚨 HIGH ALERT: WATERBORNE detected in your ward
  Risk Level: HIGH
  Recommended Action: Boil water before use. Avoid tap water for drinking. Report to local water authority.
  ```

### Test 3: Role-Based SMS Filtering

**Verify**: Only CITIZEN and HOSPITAL roles receive SMS

- Register test users with different roles via API:
  ```bash
  # Create a GOV user (should NOT receive SMS)
  curl -X POST http://localhost:5000/api/users \
    -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "gov@test.com",
      "password": "Password123",
      "role": "GOV",
      "phone": "+919876543211"
    }'

  # Create a HOSPITAL user (should receive SMS)
  curl -X POST http://localhost:5000/api/users \
    -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "hospital@test.com",
      "password": "Password123",
      "role": "HOSPITAL",
      "wardId": "SAME_WARD_AS_TEST_USER",
      "phone": "+919876543212"
    }'
  ```

- Trigger a high-risk alert in that ward
- Verify:
  - GOV user DOES NOT receive SMS
  - HOSPITAL user RECEIVES SMS
  - CITIZEN user RECEIVES SMS (from Test 1)

### Test 4: Phone Validation

**Test invalid phone formats**:

```bash
# Should FAIL - no + sign
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "919876543210"
  }'
# Expected error: "Phone must be in E.164 format"

# Should SUCCEED - valid E.164
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "+919876543210"
  }'
```

---

## 🧪 Troubleshooting

### SMS Not Sending?

1. **Check Twilio credentials**:
   ```bash
   # Verify in backend/.env
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   ```

2. **Check logs for errors**:
   ```bash
   # Backend logs should show:
   # "SMS failed: [error message]"
   # OR
   # "SMS sent to X users for alert ABC123"
   ```

3. **Verify user has phone and correct role**:
   ```bash
   db.users.findOne({
     email: "testuser@example.com",
     phone: { $ne: null },
     role: { $in: ["CITIZEN", "HOSPITAL"] }
   })
   ```

4. **Check alert was created**:
   ```bash
   db.alerts.findOne({ wardId: WARD_ID }, { sort: { createdAt: -1 } })
   ```

### Phone Not Stored?

1. Check registration payload includes phone:
   ```bash
   # In frontend signup, check Network tab for request
   ```

2. Check backend validation:
   - Use valid E.164 format: +[country_code][number]
   - Example: +919876543210 (India), +16175551234 (USA)

3. Check if field is optional - users don't HAVE to provide phone

---

## 📊 Full Flow Diagram

```
User Registration (Frontend)
    ↓ (with phone number)
    ↓
API: POST /api/auth/register
    ↓
Backend: Validate phone (E.164 format)
    ↓
Backend: Store in User model
    ↓ (phone saved in DB)
    ↓
[Later] Risk Prediction Triggers → alert.severity >= HIGH
    ↓
alertService.triggerAutoAlert()
    ↓
alertService.dispatch(alert)
    ↓
sendSMSNotification(alert)
    ↓ (parallel with email + push)
Query: Find all CITIZEN/HOSPITAL users
    in same ward with phone numbers
    ↓
For each user:
  Twilio API: sendSMS(phone, message)
    ↓
SMS delivered to user's phone
```

---

## 🎯 Key Points

✅ **Phone is optional** - Existing users won't be forced to add phone
✅ **SMS only on HIGH/CRITICAL** - Not on LOW/MEDIUM alerts
✅ **Role-based filtering** - Only CITIZEN and HOSPITAL get SMS
✅ **E.164 format required** - International standard format
✅ **Error handling** - SMS failure doesn't block email/push notifications
✅ **Scalable** - Twilio SDK handles rate limiting

---

## 📱 Example Phone Numbers for Testing

```
India:          +919876543210
USA:            +16175551234
UK:             +442071838750
Canada:         +14165557890
Australia:      +61399884567
```

Use your actual phone number or Twilio sandbox number for real testing.

---

## 🚀 Production Checklist

- [ ] Add real Twilio credentials to production `.env`
- [ ] Verify Twilio phone number is approved for production
- [ ] Test SMS with real user phone numbers
- [ ] Monitor Twilio usage and costs
- [ ] Set up SMS rate limiting if needed (Twilio has built-in limits)
- [ ] Consider SMS template customization per outbreak type
- [ ] Add SMS consent/opt-out mechanism (future enhancement)
- [ ] Test failover if SMS service goes down

---

## 📝 Next Steps

1. **Set up Twilio account** with credentials
2. **Add credentials to `.env`** (don't commit to git)
3. **Register test user** with phone number
4. **Trigger high-risk alert** in same ward
5. **Verify SMS received** on phone
6. **Test all user roles** to ensure filtering works

---

Need help? Check the implementation files:
- Backend model: `backend/src/models/index.js`
- Validation: `backend/src/validation/schemas.js`
- Alert service: `backend/src/services/alertService.js`
- Frontend form: `frontend/pages/signup.js`
