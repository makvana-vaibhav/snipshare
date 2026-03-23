# SnipShare Production Setup Guide

## Quick Start

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 2. Environment Setup

Create `.env` file in server directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snipshare
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_this
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

MongoDB collections will be created automatically:
- `users` - User accounts
- `pastes` - Code snippets
- `analytics` - Usage tracking

Indexes will be created automatically via Mongoose schemas.

### 4. Run Application

**Development:**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

**Production:**
```bash
# Server
cd server
npm start

# Client (build first)
cd client
npm run build
npm run preview
```

---

## Key Features Quick Reference

### Creating Pastes
1. **Basic Paste**: Just enter code, auto-detected language
2. **With Options**: Click "Advanced Options" for:
   - Make public (shareable)
   - Password protection
   - Self-destruct after first view
   - Expiry time

### Password-Protected Pastes
```javascript
// Create with password
POST /api/paste
{
  "content": "secret code",
  "password": "mypassword"
}

// Access with password
GET /api/paste/:id?password=mypassword
```

### User Authentication
```javascript
// Signup with remember me
POST /api/auth/signup
{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123",
  "rememberMe": true
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secure123",
  "rememberMe": true
}

// Logout
POST /api/auth/logout (requires auth)

// Refresh token
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}
```

### Paste Management
```javascript
// Create paste
POST /api/paste

// List my pastes
GET /api/paste (requires auth)

// View paste
GET /api/paste/:id

// Edit paste
PUT /api/paste/:id (requires auth, owner only)
{
  "title": "New title",
  "content": "Updated code",
  "isPublic": true
}

// Delete paste
DELETE /api/paste/:id (requires auth, owner only)
```

---

## Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Toggle fullscreen editor |
| `Tab` | Insert 4 spaces |
| `Shift+Tab` | Remove 4 spaces (if at start) |
| `Ctrl+L` | Select all (browser default) |
| `Ctrl+A` | Select all (browser default) |

---

## Logging & Monitoring

### Log Files Location
- `server/logs/requests.log` - All API requests
- `server/logs/errors.log` - Error stack traces
- `server/logs/cron.log` - Cron job activity

### View Recent Logs
```bash
# Server logs
tail -f server/logs/requests.log
tail -f server/logs/errors.log

# View all errors
grep "Error" server/logs/errors.log
```

---

## Performance Tuning

### Rate Limiting
Edit `server/src/index.js`:
```javascript
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Change window
    max: 100, // Change max requests
    // ...
});

const createPasteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Stricter for creation
    // ...
});
```

### Database Optimization
- Indexes are created automatically
- Use MongoDB Atlas for cloud hosting
- Enable write concern for reliability

---

## Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change `JWT_REFRESH_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (use reverse proxy like nginx)
- [ ] Configure CORS properly in `index.js`
- [ ] Use MongoDB connection pooling
- [ ] Enable MongoDB encryption at rest
- [ ] Set rate limits appropriate for your scale
- [ ] Review sanitization rules in `sanitization.js`
- [ ] Enable logging for audit trail
- [ ] Set up monitoring for errors
- [ ] Configure backup strategy for MongoDB
- [ ] Test password reset flow if added
- [ ] Review and test XSS protections
- [ ] Test rate limiting under load

---

## Deployment Recommendations

### Hosting Options

**Server:**
- ✅ Render.com (free tier available)
- ✅ Railway.app
- ✅ Heroku
- ✅ AWS EC2
- ✅ Digital Ocean
- ✅ Vercel (serverless)

**Database:**
- ✅ MongoDB Atlas (free tier: 512MB)
- ✅ MongoDB Enterprise
- ✅ Self-hosted MongoDB

**Frontend:**
- ✅ Vercel (Next.js optimized)
- ✅ Netlify
- ✅ Render static hosting
- ✅ Any static host (s3, etc.)

### Docker Deployment

**server/Dockerfile** already included - ready to deploy

```bash
# Build
docker build -t snipshare-server .

# Run
docker run -e MONGODB_URI=... -e JWT_SECRET=... snipshare-server
```

**client/Dockerfile** already included

```bash
# Build and deploy
docker build -t snipshare-client .
docker run -p 80:80 snipshare-client
```

---

## Troubleshooting

### Cannot connect to MongoDB
```
❌ Error: connect ECONNREFUSED
```
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

### Tokens not refreshing
```
❌ Error: Token validation failed
```
- Ensure `JWT_REFRESH_SECRET` is set
- Check token hasn't expired in refresh token table
- Clear localStorage and re-login

### Rate limiting too strict
```
❌ Error: Too many requests, please try again later
```
- Increase `max` value in rate limiters
- Adjust `windowMs` for longer windows
- For API clients, implement exponential backoff

### Pastes not auto-deleting
```
❌ Expired pastes still visible
```
- Check cron job is running: `grep "cron" server/logs/requests.log`
- Verify MongoDB TTL index exists
- Check server timezone matches expectations

### XSS concerns
```
❌ HTML tags appearing in pastes
```
- Don't disable sanitization
- Pastes are rendered as code, not HTML
- Prism.js handles escaping internally

---

## Monitoring & Analytics

### View Dashboard Stats
```bash
# Get user paste count
curl http://localhost:5000/api/paste \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check health
curl http://localhost:5000/api/health
```

### Database Queries for Stats
```javascript
// All pastes created
db.pastes.find().count()

// Public pastes
db.pastes.find({ isPublic: true }).count()

// Most viewed
db.pastes.find().sort({ viewCount: -1 }).limit(10)

// Pastes with passwords
db.pastes.find({ passwordHash: { $ne: null } }).count()

// Average views per paste
db.pastes.aggregate([
  { $group: { _id: null, avgViews: { $avg: "$viewCount" } } }
])
```

---

## Scaling Considerations

### Traffic Growth
1. **Caching**: Add Redis for session/token caching
2. **CDN**: Serve static assets from CDN
3. **Database**: Scale MongoDB (sharding/replicas)
4. **Load Balancing**: Use reverse proxy with multiple server instances

### Storage Growth
1. Implement S3 for large pastes (>1MB)
2. Archive old pastes to cold storage
3. Implement hard limit on paste size

### Performance
1. Add search/filtering capabilities
2. Implement pagination for dashboards
3. Use database projection to reduce payload size
4. Implement caching headers for static content

---

## Backup & Recovery

### MongoDB Backup
```bash
# Full backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/snipshare" \
  --out ./backup

# Restore
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/snipshare" \
  ./backup
```

### Automated Backups
- Enable MongoDB Atlas automated backups (24-hour retention standard)
- Setup external backup to S3

---

## Support & Contributing

For issues or feature requests:
1. Check existing GitHub issues
2. Create detailed bug reports
3. Include logs and steps to reproduce
4. Follow code style guidelines

---

## License

ISC - See LICENSE file for details
