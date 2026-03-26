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

## Docker / DevOps Setup

This repository now includes production-style containerization for the full stack:

- `mongodb` service (persistent volume + healthcheck)
- `api-server` service (Node.js API + healthcheck)
- `client` service (Nginx serving Vite build + reverse proxy to API)

### 1. Configure environment variables

Create a root `.env` file (used by Docker Compose interpolation):

```env
JWT_SECRET=replace_with_secure_secret
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret
FRONTEND_URL=http://localhost:8080
API_PUBLIC_URL=http://localhost:5005

# Optional SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### 2. Build and run

```bash
docker compose up -d --build
```

### 3. Access services

- Frontend: `http://localhost:8080`
- API health: `http://localhost:5005/api/health`
- MongoDB: `mongodb://localhost:27017/snipshare`

### 4. Stop services

```bash
docker compose down
```

To remove volumes too:

```bash
docker compose down -v
```

## AWS Deployment (MongoDB Atlas + GitHub Actions)

Use this path when MongoDB stays on Atlas and only frontend/backend run on AWS server.

### 1) Prepare AWS server instance

- Launch Ubuntu server instance
- Open inbound ports: `22`, `80`, `443`
- Install Docker + Compose plugin

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
sudo usermod -aG docker $USER
```

Log out and log in again once.

### 2) Clone repo on server

```bash
git clone https://github.com/makvana-vaibhav/snipshare.git
cd snipshare
cp .env.deploy.example .env.deploy
```

Edit `.env.deploy` with real values (`MONGO_URI`, JWT secrets, domains).

### 3) Start once manually (sanity check)

```bash
docker compose -f docker-compose.deploy.yml --env-file .env.deploy up -d --build
docker compose -f docker-compose.deploy.yml --env-file .env.deploy ps
```

### 4) Configure domain

- Point your domain A record to server public IP.
- If you want HTTPS, put Nginx/Caddy/ALB in front and terminate TLS.

### 5) Configure GitHub Actions secrets

In GitHub repo settings, add:

- `DEPLOY_HOST` (public IP or DNS)
- `DEPLOY_USER` (e.g. `ubuntu`)
- `DEPLOY_SSH_KEY` (private key)
- `DEPLOY_APP_DIR` (e.g. `/home/ubuntu/snipshare`)

### 6) CI/CD behavior

Workflow file: `.github/workflows/deploy.yml`

- On every push to `main`:
    1. SSH into server
    2. Pull latest code from `main`
    3. Rebuild client/server images on server
    4. Recreate containers with `docker compose`

### 7) Atlas note

No Mongo container is used in deploy flow. API connects directly to Atlas via `MONGO_URI` from `.env.deploy`.

---
*Built by Vaibhav Makvana*

