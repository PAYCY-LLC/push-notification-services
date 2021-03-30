import { Router } from 'express'
import PushNotificationRoutes from './api/push.notif.routes'
import PushNotificationAdminRoutes from './api/push.notif.admin.routes'
import IdentityRoutes from './api/identity.routes'
// import AuthorizationMiddleware from '../middlewares/auth.middleware'

class Routes {
    constructor(identityService, pushNotificationService) {
        this.router = new Router()
        this.pushNotifRoutes = new PushNotificationRoutes(this.router, pushNotificationService)
        this.pushNotifAdminRoutes = new PushNotificationAdminRoutes(this.router, pushNotificationService)
        this.identityRoutes = new IdentityRoutes(this.router, identityService)

        // this.router.use('/api/v1/pns', AuthorizationMiddleware.authenticateToken, this.pushNotifRoutes.getRouter());
        // router.use('/api/v1/admin', AuthorizationMiddleware.authorizeAdmin, this.pushNotifAdminRoutes.getRouter());
        this.router.use('/api/v1/pns', this.pushNotifRoutes.getRouter());
        this.router.use('/api/v1/admin', this.pushNotifAdminRoutes.getRouter());
        this.router.use('/api/v1/identity', this.identityRoutes.getRouter());
    }

    getRouter() {
        return this.router
    }
}

export default Routes
