import DataCollectorService from './data.collector.service';
import PriceChangeAnalysisService from './analysis/price.change.analysis.service';
import ChannelType from '../../models/channel.type';
// import TrendingAnalysisService from '../analysis/trending.analysis.service';

class MonitoringService {
    constructor(logger, baseCurrency, messagingService, coinInfoService) {
        this.logger = logger;
        this.baseCurrency = baseCurrency
        this.messagingService = messagingService
        this.coinInfoService = coinInfoService
        this.activeCoins = []

        this.dataCollectorService = new DataCollectorService(
            this.logger,
            this.coinInfoService
        );

        this.priceChangeAnalysisService = new PriceChangeAnalysisService(
            this.logger,
            this.baseCurrency,
            this.messagingService,
            this.dataCollectorService,
            this.storageService
        );

        // this.trendingAnalysisService = new TrendingAnalysisService(
        //     this.logger,
        //     this.coinsConfig,
        //     this.messagingProvider,
        //     this.dataCollectorService,
        //     this.storageService
        // );

        this.start()
    }

    async start() {
        this.startAnalysisServices()
    }

    async getActiveCoins() {
        return this.activeCoins
    }

    async updateActiveCoins(channelType, newCoinId) {
        if (channelType === ChannelType.CRYPTO_PRICE) {
            this.priceChangeAnalysisService.updateActiveCoins(newCoinId)
        } else {
            // trends
        }
    }

    async startAnalysisServices() {
        await new Promise(r => setTimeout(r, 5000));
        this.priceChangeAnalysisService.start()

        // await new Promise(r => setTimeout(r, 6000));
        // this.trendingAnalysisService.start()
    }
}

export default MonitoringService;
