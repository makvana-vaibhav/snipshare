# SnipShare ✦

SnipShare is a lightning-fast, open-source code sharing platform built on the MERN stack (MongoDB, Express, React, Node.js). It provides a sleek, modern UI for developers to instantly share code snippets with full syntax highlighting, automatic expirations, and secure URLs.

## Features

- **Instant Code Sharing:** Paste any text or code and generate a secure 6-digit shortcode URL.
- **Self-Destructing Pastes:** Set snippets to automatically expire after 1 hour, 1 day, or 1 week using Native MongoDB TTL indexes.
- **Secure Authentication:** JWT-based user accounts allow you to track your snippets, view history, and manually delete active codes.
- **Analytics Dashboard:** Monitor total global clip views and manage your expiration queues directly from a personalized dashboard.
- **Modern & Aesthetic Theme:** A premium, fully responsive dark mode UI featuring deep obsidian backgrounds (`#0A0A0A`) and vivid Amber accents (`#F59E0B`). 
- **SEO Optimized:** Dynamically rendered `<title>` and metadata injections across all routes for maximum search indexing.
- **Mobile Responsive:** Flex layouts operate perfectly on desktop, tablet, and mobile browsers.

## Tech Stack

- **Frontend:** React + Vite, Custom CSS (Vanilla Theme Engine), Axios, React Router Dom, PrismJS, React Helmet Async logic
- **Backend:** Node.js, Express, Mongoose, Express-Rate-Limit, CORS, JWT Auth, Bcrypt
- **Database:** MongoDB Atlas
- **Cloud Hosting:** Render (Backend API), Netlify (Frontend SPA)

## Project Structure

```text
snipshare/
├── client/                 # React Frontend application
│   ├── public/             # Static assets (Favicon, _redirects)
│   └── src/
│       ├── api/            # Axios instance and interceptors
│       ├── components/     # Reusable UI (Navbar, CodeEditor, CodeBlock)
│       ├── context/        # React Auth Context provision
│       ├── hooks/          # Custom hooks (useSEO)
│       └── pages/          # Primary Routes (Home, Dashboard, PasteView, Auth)
└── server/                 # Node.js Express Backend API
    └── src/
        ├── controllers/    # Route handler logic (authController, pasteController)
        ├── middlewares/    # Custom guards (authMiddleware, errorMiddleware)
        ├── models/         # Mongoose Schemas (User, Paste)
        └── routes/         # Express routing definitions
```

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

---
*Built by Vaibhav Makvana*

