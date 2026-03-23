# SnipShare ✦

SnipShare is a lightning-fast, open-source code sharing platform built on the MERN stack (MongoDB, Express, React, Node.js). It provides a sleek, modern UI for developers to instantly share code snippets with full syntax highlighting, automatic expirations, and secure URLs.

## Features

- **Instant Code Sharing:** Paste any text or code and generate a secure 6-digit shortcode URL.
- **Dynamic Syntax Highlighting:** Supports over 20+ programming languages automatically parsed via Prism.js.
- **Self-Destructing Pastes:** Set snippets to automatically expire after 1 hour, 1 day, or 1 week using Native MongoDB TTL indexes.
- **Dark Mode Aesthetic:** Premium glassmorphism UI tailored with modern developer aesthetics.
- **Mobile Responsive:** Flex layouts operate perfectly on desktop, tablet, and mobile browsers.

## Tech Stack

- **Frontend:** React + Vite, Custom CSS (Vanilla), Axios, React Router Dom, PrismJS
- **Backend:** Node.js, Express, Mongoose, Express-Rate-Limit, CORS
- **Database:** MongoDB Atlas
- **Cloud Hosting:** Render (Backend API), Netlify (Frontend SPA)

## Local Development

### 1. Clone the repository
```bash
git clone https://github.com/makvana-vaibhav/snipshare.git
cd snipshare
```

### 2. Backend Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5005
MONGO_URI=mongodb://localhost:27017/snipshare
JWT_SECRET=your_jwt_secret_here
```

### 3. Start the Backend
```bash
cd server
npm install
npm run dev
```

### 4. Start the Frontend
The frontend uses Vite and automatically falls back to `http://localhost:5005/api` for local development.
```bash
cd client
npm install
npm run dev
```

## Production Deployment

The application is completely configured for modern cloud services. 

**Backend (Render):**
Deploy the `server` directory as a Node Web Service on Render. Make sure the `Start Command` is correctly mapped to `npm start` and add your Atlas `MONGO_URI` connection string to your Render Environment Keys.

**Frontend (Netlify):**
Point Netlify to the `client` directory. Netlify inherently understands the Vite build step, uses `client/public/_redirects` for React Router DOM integration, and discovers the remote Production backend dynamically.

