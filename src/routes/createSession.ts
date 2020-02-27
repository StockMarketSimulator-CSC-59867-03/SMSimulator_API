import * as express from 'express';
import { SessionDataModel } from './models/sessionData.model';
import { SessionUserDataModel } from './models/sessionUserData.model';
import { SetupService } from './setupService';
const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();


class CreateSessionController {
  public path = '/';
  public router = express.Router();
  private setupService: SetupService;
 
  constructor(setupService: SetupService) {
    this.router.get(this.path, this.get);
    this.setupService = setupService;
  }
 
  get = (request, response) => {


    let sessionData: SessionDataModel = {
      dateCreated: fbAdmin.firestore.FieldValue.serverTimestamp(),
      type: "private",
      startingBalance: 10000
    }

    let sessionUserData: SessionUserDataModel = {
      id:"PLACEHOLDER ID",
      liquid: 10000,
      type: "Admin"
    }

    // SHOULD change this to a firestore transactions so its atomic
    let batch = db.batch();
    let sessionRef = db.collection("Sessions").doc();
    batch.set(sessionRef, sessionData);

    let userAdminRef = sessionRef.collection("Users").doc();
    batch.set(userAdminRef, sessionUserData);

    batch.commit()
    .then(() => this.setupService.getStockDataForSymbol("MSFT", "Microsoft"))
    .then((data)=>{
      let stockFields = data["stockField"];
      let stockHistory = data["stockHistory"];
  
      // Need to check if any of the above are null or empty

      let batch = db.batch();

      console.log("Created Session");
      let stockDocRef = sessionRef.collection("Stocks").doc(stockFields["symbol"]);
      batch.set(stockDocRef, stockFields);
      for (let i = 0; i < 30; i++) {
        let historyEntry = stockDocRef.collection("Stock History").doc();
        batch.set(historyEntry, stockHistory[i]);
      }

      batch.commit().then(() => {
        console.log("Successfully Created Session");
        response.send(200);
      });

      console.log(stockHistory);
    })
    .catch((err) => {
      console.log(err);
      response.send("ERROR");
    });



  }
 
}
 
export default CreateSessionController;