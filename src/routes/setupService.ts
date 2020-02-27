import { StockDataModel } from "./models/stockData.model";
import { rejects } from "assert";

let  apiKey =  require('../../keys/stockAPIKey.json')["apiKey"];


var request = require('request');

const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();




export class SetupService {
    savedStockData = new Map();
    savedStockHistory = new Map();

    constructor(){
   
    }

  getStockDataForSymbol(symbol: string, name: string): Promise<any> {

    var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;



    return new Promise((resolve, reject) => {

      if (this.savedStockHistory.has(symbol)) {
        let stockHistory = this.savedStockHistory.get(symbol);
        if (stockHistory.length > 0) {
          let stockField: StockDataModel = {
            symbol: symbol,
            name: name,
            price: 1312312, //stockHistory[0]["price"]
            sector: "Tech"
          }
          return resolve({"stockField":stockField, "stockHistory":stockHistory});
        }
        else {
          return reject("ERROR: Empty StockHistory");
        }

      }

      console.log(">>> Calling the Stock API");

      request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
      }, (err, res, data) => {
        if (err) {
          console.log('Error at line 56:', err);
          reject();
        } else if (res.statusCode !== 200) {
          console.log('Status:', res.statusCode);
          reject();
        } else {
          
          let stockField = this.parseStockData(data, symbol, name);
          let stockHistory = this.parseStockHistory(data);

          this.savedStockHistory.set(symbol, stockHistory); // Saving the stock history locally.

          this.uploadStockHistory(symbol,stockHistory).then(()=>{
            resolve({"stockField":stockField, "stockHistory":stockHistory});
          }).catch(err =>{
            reject(err);
          });
        
        }
      });

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

  uploadStockHistory(symbol: string, stockHistory): Promise<void> {
    let batch = db.batch();
    let stockHistoryCollectionRef = db.collection("StockHistory").doc(symbol);
    let historyListRef = stockHistoryCollectionRef.collection("Stock History");
    for (let i = 0; i < 30; i++) {
      let historyEntry = historyListRef.doc(stockHistory[i]["dateTime"]);
      batch.set(historyEntry, stockHistory[i]);
    }

    batch.set(stockHistoryCollectionRef,{"updated":fbAdmin.firestore.FieldValue.serverTimestamp()});

    return new Promise((resolve, reject) => {
      batch.commit().then(() => {
        resolve();
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });

  }


    loadStocks(){
  
    }
}