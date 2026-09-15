const express = require('express');
const app = express();

// NOTE: no express.json() here on purpose — see explanation above.
// The gateway must forward the raw request body untouched to the target service.

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Verifies the JWT on every protected request.
function authToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Please send token' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });

    req.user = decoded;
    // Pass the verified identity downstream as headers, so the microservice
    // trusts the Gateway's word instead of re-verifying the JWT itself.
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    next();
  });
}

// Middleware factory: only lets a request through if the JWT's role matches.
function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Unauthorized: wrong role for this route' });
    }
    next();
  };
}

// Builds a proxy handler for a given backend port, restoring the full
// original path (see Bug 1 above) before forwarding.
function forwardTo(port) {
  return (req, res) => {
    req.url = req.originalUrl;
    proxy.web(req, res, { target: `http://localhost:${port}` }, (err) => {
      console.error(`Proxy error forwarding to port ${port}:`, err.message);
      if (!res.headersSent) res.status(502).json({ message: 'Upstream service unavailable' });
    });
  };
}

// PUBLIC — no token exists yet at registration/login time
app.use('/register', forwardTo(5001));
app.use('/auth', forwardTo(5002));

// PROTECTED — token required, and role must match the route
app.use('/admin', authToken, authRole('admin'), forwardTo(5003));
app.use('/user', authToken, authRole('user'), forwardTo(5004));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.listen(4000, () => console.log('API Gateway Service is running on PORT NO: 4000'));
