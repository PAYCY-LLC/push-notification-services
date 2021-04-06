class XRate {
    constructor(coinId, coinCode, coinName, fiatCode, rate, timestamp) {
        this.coinId = coinId
        this.coinCode = coinCode
        this.coinName = coinName
        this.fiatCode = fiatCode
        this.rate = rate
        this.timestamp = timestamp
    }
}

export default XRate
