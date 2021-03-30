class Provider {
    constructor(rateLimit) {
        this.rateLimit = rateLimit
    }

    static get COINGECKO() {
        return 'coingecko';
    }

    static get CRYPTOCOMPARE() {
        return 'cryptocompare';
    }
}

export default Provider;
