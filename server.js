const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me';
const database = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kimutai_analytics',
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10
});

app.use(cors());
app.use(express.json());

function createToken(user) {
    return jwt.sign({
        id: user.id,
        firstName: user.firstName,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
    }, jwtSecret, { expiresIn: '7d' });
}

function validateCredentials(email, password) {
    if (!email || !email.includes('@')) return 'A valid email is required.';
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    return null;
}

function validateProfile(firstName, username) {
    if (!firstName || firstName.trim().length < 2) return 'First name must be at least 2 characters.';
    if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) return 'Username must be 3-30 letters, numbers, or underscores.';
    return null;
}

app.get('/api/health', (request, response) => {
    response.json({ status: 'ok', service: 'Kimutai Analytics API' });
});

app.post('/api/auth/signup', async (request, response) => {
    try {
        const email = request.body.email?.trim().toLowerCase();
        const password = request.body.password;
        const firstName = request.body.firstName?.trim();
        const username = request.body.username?.trim().toLowerCase();
        const validationError = validateCredentials(email, password);
        const profileError = validateProfile(firstName, username);

        if (validationError) return response.status(400).json({ error: validationError });
        if (profileError) return response.status(400).json({ error: profileError });

        const [existingUsers] = await database.execute('SELECT email, username FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.some((user) => user.email === email)) {
            return response.status(409).json({ error: 'An account with this email already exists.' });
        }
        if (existingUsers.length) {
            return response.status(409).json({ error: 'That username is already taken.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await database.execute('INSERT INTO users (first_name, username, email, password_hash) VALUES (?, ?, ?, ?)', [firstName, username, email, passwordHash]);
        const user = { id: result.insertId, firstName, username, email };

        response.status(201).json({
            message: 'Account created successfully.',
            token: createToken(user),
            user: { id: user.id, firstName: user.firstName, username: user.username, email: user.email }
        });
    } catch (error) {
        response.status(500).json({ error: 'Could not create the account.' });
    }
});

app.post('/api/auth/login', async (request, response) => {
    try {
        const email = request.body.email?.trim().toLowerCase();
        const password = request.body.password;
        const [users] = await database.execute('SELECT id, first_name AS firstName, username, email, role, password_hash AS passwordHash FROM users WHERE email = ?', [email]);
        const user = users[0];
        const passwordMatches = user && await bcrypt.compare(password || '', user.passwordHash);

        if (!user || !passwordMatches) {
            return response.status(401).json({ error: 'Email or password is incorrect.' });
        }

        response.json({
            message: 'Logged in successfully.',
            token: createToken(user),
            user: { id: user.id, firstName: user.firstName, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        response.status(500).json({ error: 'Could not log in.' });
    }
});

function requireAuth(request, response, next) {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) return response.status(401).json({ error: 'Authentication is required.' });

    try {
        request.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        response.status(401).json({ error: 'Your session has expired.' });
    }
}

function requireAdmin(request, response, next) {
    if (request.user.role !== 'admin') {
        return response.status(403).json({ error: 'Administrator access is required.' });
    }

    next();
}

app.get('/api/auth/me', requireAuth, (request, response) => {
    response.json({ user: request.user });
});

app.get('/api/users', requireAuth, requireAdmin, async (request, response) => {
    try {
        const [users] = await database.execute(
            'SELECT id, first_name AS firstName, username, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC'
        );
        response.json({ users });
    } catch (error) {
        response.status(500).json({ error: 'Could not load users.' });
    }
});

app.listen(port, () => {
    console.log(`Kimutai Analytics API running at http://localhost:${port}`);
});
