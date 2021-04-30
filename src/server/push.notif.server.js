import http from 'http';
import express from 'express';
import cors from 'cors';
import logger from '../utils/logger.winston'
import db from '../models/index'
import IdentityService from '../services/identity.service'
import AppConfig from '../../config/app.config.json'
import PnsConfig from '../../config/pns.config.json'
import providerCoins from '../../config/provider.coins.json'
import DbConfig from '../../config/db.config.json'
import PushNotificationService from '../services/push.notif.service'
import Routes from '../routes'

const appConfig = AppConfig[process.env.NODE_ENV || 'development'];
const pnsConfig = PnsConfig[process.env.NODE_ENV || 'development'];
const dbConfig = DbConfig[process.env.NODE_ENV || 'development'];

const morgan = require('morgan');

class PushNotificationServer {
    constructor() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.sequelize = db.sequelize
        this.port = process.env.PORT || '5000'

        const corsOptions = {
            origin: `http://localhost:${this.port}`
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.get('/', (_, res) => {
            res.send('Push notification server is On !!!');
        });

        this.initMiddlewares();
        this.initDb()
    }

    initRoutes(router) {
        this.app.use(router);
    }

    initMiddlewares() {
        this.app.use(morgan('combined', { stream: logger.stream }));
    }

    initDb() {
        this.sequelize.sync({ force: false })
    }

    async start() {
        this.http.listen(this.port);
        await new Promise(r => setTimeout(r, 10000));
        logger.info(`App started listening port:${this.port}`)

        const identityService = new IdentityService(logger, appConfig)
        const pushNotifService = new PushNotificationService(logger, appConfig, pnsConfig, dbConfig, providerCoins)

        const routes = new Routes(identityService, pushNotifService)
        this.initRoutes(routes.getRouter())

        logger.info('Push Notif service started successfully')
    }
}

export default PushNotificationServer;
