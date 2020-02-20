import { StockDataModel } from "./models/stockData.model";

let  apiKey =  require('../../keys/stockAPIKey.json')["apiKey"];


var request = require('request');

export class SetupService {
    currentStocks = new Map();
    constructor(){
        this.loadStockDataForSymbol("AAPL", "Apple in.");
    }

    loadStockDataForSymbol(symbol: string, name: string){
        
        var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
          }, (err, res, data) => {
            if (err) {
              console.log('Error:', err);
            } else if (res.statusCode !== 200) {
              console.log('Status:', res.statusCode);
            } else {
              this.parseStockData(data, symbol, name);
            }
        });
    }

    parseStockData(data, symbol, name){
        let timeSeriesData = data["Time Series (Daily)"];
        let currentDayKey = Object.keys(timeSeriesData)[0];
        let rawStockData = timeSeriesData[currentDayKey];
        
        let stockData: StockDataModel = {
            symbol: symbol,
            name: name,
            price: parseFloat(rawStockData["1. open"]),
            sector: "Tech"
        }

        console.log(stockData);
    }

    loadStocks(){
  
    }
}