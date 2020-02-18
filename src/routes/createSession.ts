import * as express from 'express';
import { SessionDataModel } from './models/sessionData.model';
import { SessionUserDataModel } from './models/sessionUserData.model';
const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();


class CreateSessionController {
  public path = '/';
  public router = express.Router();
 
  constructor() {
    this.router.get(this.path, this.get);
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
    db.collection("Sessions").add(sessionData).then((doc)=>{
      db.collection("Sessions").doc(doc.id).collection("Users").add(sessionUserData).then(()=>{
        response.send(doc.id);
      });
    }).catch((err)=>{
      console.log(err);
      response.send("Could not create session");
    });
    
  }
 
}
 
export default CreateSessionController;