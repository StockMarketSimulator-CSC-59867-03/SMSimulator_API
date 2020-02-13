var express = require("express");
var router = express.Router();

const fbAdmin = require('firebase-admin');
const db = fbAdmin.firestore();



router.get("/", function(req, res, next){
    db.collection('Sessions').add({
        "creationDate": fbAdmin.firestore.FieldValue.serverTimestamp(),
        "type": "private"
    }).then((data)=>{
        console.log("New Session Created " + data.id);
        res.send("New Session Created " + data.id);
    }).catch((err)=>{
        console.log(err);
    });
	
});


module.exports = router;