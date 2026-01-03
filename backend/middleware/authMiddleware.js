const supabase = require('../config/db');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[Auth] Token verification failed:', error?.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Attach user to request
        req.user = user;
        req.token = token;

        console.log('[Auth] Authenticated user:', user.id);
        next();
    } catch (err) {
        console.error('[Auth] Middleware error:', err.message);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = requireAuth;
