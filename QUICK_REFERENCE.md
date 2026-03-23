# SnipShare Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Setup
cd server && npm install && cd ../client && npm install

# Development
# Terminal 1:
cd server && npm run dev
# Terminal 2:
cd client && npm run dev

# Production
cd server && npm start
# And deploy client build to static hosting
```

## 📋 Key Features at a Glance

| Feature | Status | Location |
|---------|--------|----------|
| Syntax Highlighting | ✅ | CodeEditor + Prism.js |
| Password Protected | ✅ | Paste model + View gate |
| Self-Destruct | ✅ | Auto-delete after view |
| Language Detection | ✅ | HomePage.jsx |
| Full-Screen Editor | ✅ | CodeEditor (Ctrl+K) |
| User Dashboard | ✅ | DashboardPage.jsx |
| Auth Tokens + Refresh | ✅ | AuthContext + API interceptor |
| Rate Limiting | ✅ | server/src/index.js |
| Logging | ✅ | middleware/logging.js |
| Analytics | ✅ | Analytics model |

## 🔑 Important Files

### Backend
```
server/src/
├── index.js              ← Main server + middleware setup
├── models/
│   ├── Paste.js         ← Paste schema with new fields
│   ├── User.js          ← User with refresh tokens
│   └── Analytics.js     ← NEW: Usage tracking
├── routes/
│   ├── authRoutes.js    ← Updated with refresh, logout
│   └── pasteRoutes.js   ← Updated with PUT, password, views
└── middleware/
    ├── cronJobs.js      ← NEW: Hourly expiry cleanup
    ├── logging.js       ← NEW: Request/error logging
    ├── sanitization.js  ← NEW: XSS prevention
    ├── analytics.js     ← NEW: View tracking
    └── auth.js          ← Updated middleware
```

### Frontend
```
client/src/
├── components/
│   ├── CodeEditor.jsx    ← NEW: Enhanced editor + fullscreen
│   ├── Skeleton.jsx      ← NEW: Loading skeletons
│   └── CopyButton.jsx    ← Improved feedback
├── pages/
│   ├── HomePage.jsx      ← Auto-detection + advanced options
│   ├── DashboardPage.jsx ← Stats cards + logout
│   ├── PasteViewPage.jsx ← Password gate + edit
│   ├── LoginPage.jsx     ← Remember me
│   ├── SignupPage.jsx    ← Remember me
│   └── NotFoundPage.jsx  ← Better styling
├── context/
│   └── AuthContext.jsx   ← Refresh token handling
└── api/
    └── axiosInstance.js  ← Token refresh interceptor
```

## 🔐 Authentication Flow

```
1. Signup/Login → Issue Access Token (1d) + Refresh Token (7d)
2. Store in localStorage
3. API call → Include in Authorization header
4. Token expires → Interceptor calls /refresh automatically
5. Logout → Clear tokens, invalidate refresh token
6. Remember me → Persist session across browser close
```

## 🎨 Editor Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` | Fullscreen mode |
| `Tab` | Insert 4 spaces |
| `Ctrl+A` | Select all |

## 📤 Creating a Paste

```javascript
// Basic
POST /api/paste
{ content: "code", language: "javascript" }

// With password
POST /api/paste
{ 
  content: "secret", 
  password: "mypass",
  isPublic: true,
  selfDestruct: true
}

// Response
{ slug: "123456", title: "...", ... }

// Access protected paste
GET /api/paste/123456?password=mypass
```

## 👥 User Endpoints

```javascript
// Create account
POST /auth/signup
{ username: "john", email: "j@example.com", password: "..." }

// Login
POST /auth/login
{ email: "j@example.com", password: "..." }

// Get current user
GET /auth/me
Header: Authorization: Bearer <token>

// Refresh token
POST /auth/refresh
{ refreshToken: "..." }

// Logout
POST /auth/logout
Header: Authorization: Bearer <token>
```

## 📊 Dashboard Stats

```javascript
// GET /api/paste (user's pastes)
[
  { 
    slug: "123456",
    title: "My Code",
    viewCount: 42,
    isPublic: true,
    expiresAt: "2024-03-25T..."
  }
]
```

## 🛡️ Security Best Practices

```javascript
// ✅ DO
- Hash passwords with bcrypt
- Validate all inputs
- Check authorization on protected routes
- Use HTTPS in production
- Keep JWT_SECRET secret
- Rate limit endpoints
- Sanitize user input

// ❌ DON'T
- Store passwords in plain text
- Trust client-side validation
- Expose error messages
- Use weak JWT secrets
- Disable rate limiting
- Log sensitive data
- Render HTML from user input
```

## 🐛 Debugging

```bash
# Check server logs
tail -f server/logs/requests.log
tail -f server/logs/errors.log

# Check browser console
Chrome DevTools → Console tab

# Check network requests
Chrome DevTools → Network tab

# Test API directly
curl http://localhost:5000/api/health

# Check database
mongodb://localhost:27017
```

## 📝 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=development

# Optional
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `ECONNREFUSED MongoDB` | Check MONGODB_URI, whitelist IP |
| `Token expired` | Refresh token automatically, or re-login |
| `Rate limit error` | Increase limits in index.js |
| `CORS error` | Check origin in CORS config |
| `404 on frontend` | Check routes in App.jsx |

## 📚 Useful Resources

- [Mongoose Docs](https://mongoosejs.com/)
- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Prism.js](https://prismjs.com/)
- [JWT](https://jwt.io/)

## 🎯 Testing Checklist

```javascript
// Auth
- [ ] Sign up with new account
- [ ] Login with credentials
- [ ] Remember me persists session
- [ ] Logout clears tokens
- [ ] Cannot access protected routes without token
- [ ] Token refreshes automatically

// Pastes
- [ ] Create public paste
- [ ] Create private paste
- [ ] Create password-protected paste
- [ ] View public paste
- [ ] Cannot view private without access
- [ ] Password gate works
- [ ] Self-destruct deletes after view
- [ ] Paste expires and auto-deletes
- [ ] Edit paste as owner
- [ ] Delete paste as owner
- [ ] Cannot edit/delete as non-owner

// Editor
- [ ] Line numbers display
- [ ] Syntax highlighting works
- [ ] Fullscreen toggle works (Ctrl+K)
- [ ] Tab key works
- [ ] Language detection works
- [ ] Copy button copies to clipboard

// UI
- [ ] Dashboard shows stats
- [ ] Mobile layout is responsive
- [ ] Loading states show
- [ ] Error messages display
- [ ] Toast notifications work
- [ ] Links copy properly

// Performance
- [ ] Pages load quickly
- [ ] Cron job runs hourly
- [ ] Rate limiting prevents spam
- [ ] Logs are written properly
```

## 💡 Pro Tips

1. **Auto-save drafts**: Enhance with localStorage draft saving
2. **Search**: Add full-text search with MongoDB Atlas
3. **Export**: Add export to JSON/HTML feature
4. **Themes**: Toggle dark/light mode
5. **Shortcuts**: Add slash commands like `/help`
6. **Analytics**: Create trending snippets page
7. **API Keys**: Let users generate API keys
8. **Collections**: Organize pastes in folders
9. **Comments**: Add discussion threads
10. **Preview**: Show real-time preview of rendered code

## 📞 Support

- Check PRODUCTION_UPGRADE.md for features
- Check SETUP_GUIDE.md for deployment
- Check IMPLEMENTATION_SUMMARY.md for stats
- Check code comments for implementation details

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
