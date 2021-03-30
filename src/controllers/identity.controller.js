
class IdentityController {
    constructor(logger, identityService) {
        this.logger = logger;
        this.identityService = identityService
    }

    authenticate(req, res) {
        this.identityService
            .authenticate(req.query.username, req.query.password)
            .then(result => {
                res.status(result.status).json(result);
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }
}

export default IdentityController;
