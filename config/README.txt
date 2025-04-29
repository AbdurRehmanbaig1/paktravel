# Firebase Configuration

For security reasons, we DO NOT include the Firebase service account key file in this repository.

On Render, you need to add these environment variables in the Render dashboard:

1. FIREBASE_PROJECT_ID
2. FIREBASE_PRIVATE_KEY_ID
3. FIREBASE_PRIVATE_KEY
4. FIREBASE_CLIENT_EMAIL
5. FIREBASE_CLIENT_ID
6. FIREBASE_CLIENT_CERT_URL

These values come from your Firebase service account key file. You can get this file from:
1. Go to Firebase Console (https://console.firebase.google.com/)
2. Select your project "paktravelapp"
3. Click on ⚙️ (Settings) → Project Settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"

Important: When adding FIREBASE_PRIVATE_KEY to Render, make sure to include the entire key INCLUDING the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" parts.

NEVER commit your actual Firebase credentials to version control! 