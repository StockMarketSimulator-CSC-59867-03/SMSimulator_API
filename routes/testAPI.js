var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next){
	res.send("API IS WORKING PROPERLY, BACKEND IS CONNECTED");
});

const fbAdmin = require('firebase-admin');
const serviceAccount = require('../keys/stock-market-sim-firebase-adminsdk.json');

router.get("/hello", function(req, res, next){
	res.send("HELLO");
});

module.exports = router;