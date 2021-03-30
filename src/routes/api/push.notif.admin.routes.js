import PushNotificationController from '../../controllers/push.notif.controller';
import logger from '../../utils/logger.winston';

class PushNotificationAdminRoutes {
    constructor(router, pushNotificationService) {
        this.pushNotificationController = new PushNotificationController(logger, pushNotificationService);
        this.router = router

        router.post('/send/data', (req, res) => {
            this.pushNotificationController.sendDataToChannel(req, res);
        });
    }

    getRouter() {
        return this.router
    }
}
export default PushNotificationAdminRoutes
