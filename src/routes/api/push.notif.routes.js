import PushNotificationController from '../../controllers/push.notif.controller';
import logger from '../../utils/logger.winston';

class PushNotificationRoutes {
    constructor(router, pushNotificationService) {
        this.pushNotificationController = new PushNotificationController(logger, pushNotificationService);
        this.router = router

        this.router.get('/messages/:token', (req, res) => {
            this.pushNotificationController.getCachedMessages(req, res);
        });

        this.router.post('/subscribe/:token', (req, res) => {
            this.pushNotificationController.subscribeToChannel(req, res);
        });

        this.router.post('/subscribe', (req, res) => {
            this.pushNotificationController.subscribeToChannels(req, res);
        });

        this.router.post('/unsubscribe/:token', (req, res) => {
            this.pushNotificationController.unSubscribeFromChannel(req, res);
        });

        this.router.get('/unsubscribeall/:token', (req, res) => {
            this.pushNotificationController.unSubscribeFromAllChannels(req, res);
        });

        this.router.post('/unsubscribe', (req, res) => {
            this.pushNotificationController.unSubscribeFromChannels(req, res);
        });

        this.router.get('/channels/:token', (req, res) => {
            this.pushNotificationController.getChannels(req, res);
        });
    }

    getRouter() {
        return this.router
    }
}

export default PushNotificationRoutes
