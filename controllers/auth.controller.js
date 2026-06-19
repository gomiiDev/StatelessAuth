import { JwtService } from '../services/jwt.service.js';

// Usuario simulado (en un caso real vendría de una base de datos).
const DEMO_USER = {
    id: 1,
    name: 'admin',
    username: 'admin',
    password: 'admin123'
};

export class AuthController {
    /**
     * Simula un servidor de autenticación que genera un token.
     */
    static async generateToken(req, res) {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ error: 'username y password son requeridos' });
        }

        // Validación simulada de credenciales.
        if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = JwtService.signToken({ id: DEMO_USER.id, name: DEMO_USER.name });

        return res.json({ token, expiresIn: 60 });
    }
}
