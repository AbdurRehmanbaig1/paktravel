# Setting Up PakTravel Backend on Render

This guide will walk you through deploying the PakTravel backend API on Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at [render.com](https://render.com))
3. Your Firebase credentials

## Step 1: Push the Code to GitHub

1. Create a new repository at [github.com/AbdurRehmanbaig1/paktravel](https://github.com/AbdurRehmanbaig1/paktravel)
2. Push the backend-for-render code to this repository

## Step 2: Create a Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Connect your GitHub account if you haven't already
4. Select the repository containing your backend code
5. Configure the service:
   - **Name**: paktravel-api (or your preferred name)
   - **Region**: Choose the one closest to your users
   - **Branch**: main (or your default branch)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan if needed)

## Step 3: Configure Environment Variables

In the Render dashboard, add the following environment variables:

1. `PORT`: 5000 (or leave empty to let Render choose)
2. `FIREBASE_PROJECT_ID`: paktravelapp
3. `FIREBASE_PRIVATE_KEY_ID`: [Your private key ID]
4. `FIREBASE_PRIVATE_KEY`: [Your private key, including the BEGIN and END parts]
5. `FIREBASE_CLIENT_EMAIL`: [Your client email]
6. `FIREBASE_CLIENT_ID`: [Your client ID]
7. `FIREBASE_CLIENT_CERT_URL`: [Your cert URL]

**Important**: For the `FIREBASE_PRIVATE_KEY`, copy the entire key including line breaks. Render handles multi-line environment variables correctly.

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your service
3. Once deployed, you'll get a URL like `https://paktravel-api.onrender.com`

## Step 5: Update Frontend Configuration

Update the API URL in your frontend to point to your new Render backend:

```javascript
// In frontend/.env.production
REACT_APP_API_URL=https://paktravel-api.onrender.com/api
```

## Troubleshooting

If you encounter issues:

1. Check the Render logs for error messages
2. Verify that your environment variables are set correctly
3. Make sure your Firebase credentials are valid
4. Check that the `private_key` is properly formatted with newlines

## Resources

- [Render Node.js Documentation](https://render.com/docs/deploy-node-express-app)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup) 