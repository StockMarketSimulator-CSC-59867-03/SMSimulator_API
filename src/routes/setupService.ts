import { StockDataModel } from "./models/stockData.model";

let  apiKey =  require('../../keys/stockAPIKey.json')["apiKey"];


var request = require('request');

export class SetupService {
    currentStocks = new Map();
    constructor(){
   
    }

    getStockDataForSymbol(symbol: string, name: string, callback: any){
        
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
              let stockField = this.parseStockData(data, symbol, name);
              let stockHistory = this.parseStockHistory(data);
              callback(stockField,stockHistory);
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

        return stockData;
    }

    parseStockHistory(data){

      let historyArray = [];
      let timeSeriesData = data["Time Series (Daily)"];
      if (Object.keys(timeSeriesData).length >= 30) {
        for (let i = 0; i < 30; i++) {
          let currentKey = Object.keys(timeSeriesData)[i];
          let newDataPoint = { "dateTime": currentKey, "price": parseFloat(timeSeriesData[currentKey]["4. close"] )};
          historyArray.push(newDataPoint);
        }
      }
      
      return historyArray;
    }

    loadStocks(){
  
    }
}