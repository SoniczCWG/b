// libs
import { Observable } from 'rxjs'

// interfaces
import { IBittrexMarket, IBittrexMarketTicker, IBittrexMarketHistory } from '../interfaces/bittrex'
import { IMarketState } from '../interfaces/markets'

// utils
import { fetchBittrexMarketTicker, fetchMarketHistory } from '../rest/bittrex'

export const flattenMarkets = (markets: IBittrexMarket[]): Observable<IBittrexMarket> =>
    Observable.from(markets)

export const isBTCMarket = (market: IBittrexMarket): boolean =>
    market.BaseCurrency === 'BTC'

export const isActive = (market: IBittrexMarket): boolean =>
    market.IsActive === true

export const sellTarget = (price: number, minProfit: number): number =>
    ( price / 100 ) * ( 100 + minProfit )

export const buyTarget = (price: number, minProfit: number): number =>
    ( price / 100 ) * ( 100 - minProfit )

export const combineMarketData = (market: IBittrexMarket): Observable<IMarketState> =>
    Observable.forkJoin(
        fetchMarketHistory(market),
        fetchBittrexMarketTicker(market),
        (history: IBittrexMarketHistory[], ticker: IBittrexMarketTicker) =>
            toMarketState(market, history, ticker)
    )

export const toMarketState = (market: IBittrexMarket, history: IBittrexMarketHistory[], ticker: IBittrexMarketTicker): IMarketState => ({
    market,
    ticker,
    history: history.map(h => ({
        timestamp: new Date(h.TimeStamp).valueOf(),
        price: h.Price
    })),
    orderStatus: {
        isOpen: false,
        type: null,
        orderPrice: null,
        originalPrice: null
    }
})

export const updatePriceHistory = (marketState: IMarketState): Observable<IMarketState> =>
    fetchBittrexMarketTicker(marketState.market)
        .map((ticker: IBittrexMarketTicker) => ({
            ...marketState,
            ticker,
            history: [{
                timestamp: Date.now(),
                price: ticker.Ask
            }, ...marketState.history ]
        }))

export const getPriceHistory = (marketState: IMarketState): number[] =>
    marketState.history.map(h => h.price)

export const getLatestPrice = (marketState: IMarketState): number =>
    getPriceHistory(marketState) && getPriceHistory(marketState)[0] || 0

export const getPreviousPrice = (marketState: IMarketState): number =>
    getPriceHistory(marketState) && getPriceHistory(marketState)[1] || 0

export const interval = (timeout: number): Observable<number> =>
    Observable.timer(0, timeout)

export const toObservable = (marketStates: IMarketState[]): Observable<IMarketState> =>
    Observable.from(marketStates)

export const updateMarketState = (updatedState: IMarketState, marketStates: IMarketState[]): IMarketState[] =>
    marketStates.map((marketState: IMarketState) => 
        marketState.market.MarketCurrency === updatedState.market.MarketCurrency
            ? updatedState
            : marketState)
