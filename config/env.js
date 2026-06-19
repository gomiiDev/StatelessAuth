import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Carga una llave desde disco fallando con un mensaje claro si la ruta no está
 * configurada o el archivo no existe (evita errores crípticos en runtime).
 */
const readKey = (envVar) => {
    const path = process.env[envVar];
    if (!path) {
        throw new Error(`Falta la variable de entorno ${envVar} (ruta a la llave RS256)`);
    }
    try {
        return fs.readFileSync(path, 'utf8');
    } catch {
        throw new Error(`No se pudo leer la llave en ${envVar}=${path}`);
    }
};

export const config = {
    PORT: process.env.PORT || 3000,
    PRIVATE_KEY: readKey('PRIVATE_KEY_PATH'),
    PUBLIC_KEY: readKey('PUBLIC_KEY_PATH'),
    ALGORITHM: process.env.JWT_ALGORITHM || 'RS256' // firmado asimétrico
};
