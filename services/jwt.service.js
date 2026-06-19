import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Tiempo de vida del token: 1 minuto (los JWT son stateless y de vida corta).
const TOKEN_TTL_SECONDS = 60;

export class JwtService {
    /**
     * Firma un token JWT de forma asimétrica (RS256) con la llave privada.
     * @param {Object} user - Usuario autenticado ({ id, name }).
     * @returns {string} El token JWT generado.
     */
    static signToken(user) {
        const payload = {
            sub: user.id,
            name: user.name
        };

        return jwt.sign(payload, config.PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: TOKEN_TTL_SECONDS // establece el claim `exp` (now + 1 minuto)
        });
    }

    static verifyToken(token) {
        return jwt.verify(token, config.PUBLIC_KEY, {
            algorithms: ['RS256']
        });
    }
}
