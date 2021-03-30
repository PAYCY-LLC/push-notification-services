import Redis from 'redis'

const { promisifyAll } = require('bluebird');

promisifyAll(Redis);

class MessageCacheService {
    constructor(logger, appConfig, dbConfig) {
        this.logger = logger
        this.appConfig = appConfig

        this.cacheClient = Redis.createClient(dbConfig.redis)
        this.cacheExpiration = appConfig.notification.cache_expiration
    }

    pushMessage(key, value) {
        return this.cacheClient.setAsync(key, value, 'EX', this.cacheExpiration)
    }

    getMessage(key) {
        return this.cacheClient.getAsync(key)
    }
}

export default MessageCacheService
