import express from 'express';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import resourceRoutes from './routes/resource.routes.js';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', resourceRoutes);

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});
