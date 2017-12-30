// functions
import { movingAverageStrategy } from './strategies/movingAverage'
import { tradeBot } from './trader/tradeBot';
import { map } from 'rxjs/operators/map';
import { stopLossStrategy } from './strategies/stopLoss';

// constants
const API_KEY = process.env.API_KEY
const API_SECRET = process.env.API_SECRET

const AUTO_BUY = false
const AUTO_SELL = false
const MIN_PROFIT_PERCENTAGE = 1
const TRANSACTION_FEE_PERCENTAGE = 0.5
const STOP_LOSS = 0.0001
const ANALYSIS_INTERVAL = 10000

const strategies = [
    movingAverageStrategy({
        minPriceHistory: 15,
        periodSize: 15,
        minProfit: MIN_PROFIT_PERCENTAGE + TRANSACTION_FEE_PERCENTAGE
    }),
    stopLossStrategy({
        maxLoss: 0.0001
    })
]

tradeBot({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    autoBuy: false,
    autoSell: false,
    tradeInterval: 10000,
    strategies
})
