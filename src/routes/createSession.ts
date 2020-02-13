import * as express from 'express';
const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();


class CreateSessionController {
  public path = '/';
  public router = express.Router();
 
  constructor() {
    this.router.get(this.path, this.get);
  }
 
  get = (request, response) => {
    db.collection("Sessions").add({
      "dateCreated": fbAdmin.firestore.FieldValue.serverTimestamp(),
      "type": "private"
    }).then((doc)=>{
      response.send(`Session Created Session ID is ${doc.id}`);
    }).catch((err)=>{
      console.log(err);
      response.send("Could not create session");
    });
    
  }
 
}
 
export default CreateSessionController;