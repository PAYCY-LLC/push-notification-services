import IdentityController from '../../controllers/identity.controller';
import logger from '../../utils/logger.winston';

class IdentityRoutes {
    constructor(router, identityService) {
        this.identityController = new IdentityController(logger, identityService);
        this.router = router

        this.router.get('/authenticate', (req, res) => {
            this.identityController.authenticate(req, res)
        });
    }

    getRouter() {
        return this.router
    }
}

export default IdentityRoutes
