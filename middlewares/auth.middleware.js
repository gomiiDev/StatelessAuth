import jwt from 'jsonwebtoken';
import { JwtService } from '../services/jwt.service.js';

/**
 * Middleware de verificación automática de JWT.
 * Protege rutas de forma stateless: extrae el Bearer token, valida la firma
 * asimétrica y la expiración, y adjunta el payload a req.user.
 */
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Debe existir el header con el esquema "Bearer <token>".
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticación ausente' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return res.status(401).json({ error: 'Token de autenticación ausente' });
    }

    try {
        // 2. Verificación asimétrica (firma + expiración).
        const payload = JwtService.verifyToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        // 3. Responder apropiadamente según el tipo de excepción.

        // Expiración: el cliente debe re-autenticarse -> 401.
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expirado' });
        }

        // Token presente pero no confiable (firma/algoritmo/forma) -> 403.
        if (err instanceof jwt.JsonWebTokenError) {
            // err.message: 'invalid algorithm', 'invalid signature',
            // 'jwt malformed', 'jwt signature is required' (alg: none), etc.
            const reason =
                err.message === 'invalid algorithm'
                    ? 'Algoritmo de firma no permitido'
                    : 'Firma de token inválida';
            return res.status(403).json({ error: reason });
        }

        // Cualquier otra excepción inesperada se delega al manejador global.
        return next(err);
    }
};
