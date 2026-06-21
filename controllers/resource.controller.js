import * as Sentry from '@sentry/node';

export class ResourceController {
    // ERROR OPERACIONAL: lanza excepción interna que escala a Sentry
    // vía setupExpressErrorHandler (sin captura explícita).
    static getAlphaPrivateData(req, res, next) {
        try {
            throw new Error('Conexión perdida con la BDD');
        } catch (err) {
            return next(err);
        }
    }

    // ERROR OPERACIONAL: captura explícita con Sentry.captureException +
    // tags de contexto (userId del JWT, sin datos sensibles).
    static getBetaPrivateData(req, res) {
        try {
            throw new Error('Fallo interno en service-beta');
        } catch (err) {
            Sentry.withScope((scope) => {
                scope.setTag('service', 'service-beta');
                scope.setTag('userId', req.user?.sub);
                scope.setExtra('userName', req.user?.name);
                scope.setExtra('endpoint', '/v1/service-beta/private');
                Sentry.captureException(err);
            });
            return res.status(500).json({
                service: 'service-beta',
                error: 'Error operacional capturado y reportado a Sentry'
            });
        }
    }
}
