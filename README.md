# PakTravel Backend API

REST API for the PakTravel App - A Travel Agency Management System

## Tech Stack
- Node.js
- Express
- Firebase Admin SDK (Firestore)

## Features
- Client CRUD operations
- Tour CRUD operations
- Firebase integration for data persistence

## Environment Variables

You need to set the following environment variables in your Render dashboard:

```
PORT=5000
FIREBASE_PROJECT_ID=paktravelapp
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_cert_url
```

**Important**: When adding `FIREBASE_PRIVATE_KEY` to Render, make sure to copy the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts.

## Deploying to Render

1. Create a new Web Service in Render
2. Connect to this GitHub repository
3. Use the following settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the environment variables listed above
5. Deploy!

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:phoneNumber` - Get a client by phone number
- `POST /api/clients` - Create a new client
- `DELETE /api/clients/:phoneNumber` - Delete a client

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/:clientPhone/:tourId` - Get a specific tour
- `POST /api/tours` - Create a new tour
- `DELETE /api/tours/:tourId` - Delete a tour

## Local Development

1. Clone this repository
2. Create a `.env` file based on the example
3. Run `npm install`
4. Run `npm run dev`

The API will be available at http://localhost:5000 