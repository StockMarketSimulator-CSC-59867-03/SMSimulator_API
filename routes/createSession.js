var express = require("express");
var router = express.Router();

const fbAdmin = require('firebase-admin');


router.get("/", function(req, res, next){
	res.send("HELLO");
});



module.exports = router;