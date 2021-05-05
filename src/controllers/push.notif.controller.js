
class PushNotificationController {
    constructor(logger, pushNotificationService) {
        this.logger = logger;
        this.pushNotificationService = pushNotificationService
    }

    getCachedMessages(req, res) {
        this.pushNotificationService
            .getCachedMessages(req.params.token)
            .then(response => {
                res.status(response.status).json(response);
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    sendDataToChannel(req, res) {
        this.pushNotificationService
            .sendDataToChannel(
                req.body.channel || req.body.topic,
                req.body.message
            )
            .then(response => {
                if (response.error) res.status(200).json({ error: response.error });
                else res.status(200).json({ success: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    subscribeToChannel(req, res) {
        this.pushNotificationService
            .subscribeToChannel(req.params.token, req.body, req.body.bundle_id)
            .then(response => {
                res.status(200).json({ Status: 'Ok', Response: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    subscribeToChannels(req, res) {
        this.pushNotificationService
            .subscribeToChannels(req.body.token, req.body.channels || req.body.topics, req.body.bundle_id)
            .then(response => {
                res.status(200).json({ Status: 'Ok', Response: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    unSubscribeFromChannel(req, res) {
        this.pushNotificationService
            .unSubscribeFromChannel(req.params.token, req.body)
            .then(response => {
                res.status(200).json({ Status: 'Ok', Response: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    unSubscribeFromChannels(req, res) {
        this.pushNotificationService
            .unSubscribeFromChannels(req.body.token, req.body.channels || req.body.topics)
            .then(response => {
                res.status(200).json({ Status: 'Ok', Response: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    unSubscribeFromAllChannels(req, res) {
        this.pushNotificationService
            .unSubscribeFromAllChannels(req.params.token)
            .then(response => {
                res.status(200).json({ Status: 'Ok', Response: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    getChannels(req, res) {
        this.pushNotificationService
            .getChannels(req.params.token)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }


    removeDevice(req, res) {
        this.pushNotificationService
            .removeDevice(req.params.token)
            .then(response => {
                res.status(200).json({ success: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }

    removeChannel(req, res) {
        this.pushNotificationService
            .removeChannel(req.params.channelName)
            .then(response => {
                res.status(200).json({ success: response });
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }
}

export default PushNotificationController;
