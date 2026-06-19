export class ResourceController {
    /**
     * Simula un recurso privado del Microservicio Alpha.
     * Stateless: solo confía en el payload verificado (req.user), sin estado
     * compartido ni dependencia del Servicio Beta.
     */
    static getAlphaPrivateData(req, res) {
        return res.json({
            service: 'service-alpha',
            message: 'Acceso autorizado al recurso privado del Servicio Alpha',
            user: { id: req.user.sub, name: req.user.name }
        });
    }

    /**
     * Simula un recurso privado del Microservicio Beta.
     * Valida el mismo token contra la llave pública compartida, de forma
     * independiente del Servicio Alpha.
     */
    static getBetaPrivateData(req, res) {
        return res.json({
            service: 'service-beta',
            message: 'Acceso autorizado al recurso privado del Servicio Beta',
            user: { id: req.user.sub, name: req.user.name }
        });
    }
}
