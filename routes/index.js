const express = require('express');
const router = express.Router();

// Require PostgreSQL library
const {Client, Query} = require("pg");

// DB credentials
var username = "postgres"
var password = "Alphatau1"
var host = "localhost:5432"
var database = "cambridge"
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database;

var coffeeQuery = "SELECT row_to_json(fc) FROM (\
					SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (\
					SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry,\
					row_to_json((id, name)) As properties FROM cambridge_coffee_shops As lg\
					) As f\
				) As fc"


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/map', function(err, res){
	const client = new Client(conString);
	client.connect();

	client.query(coffeeQuery, (err, qResult)=>{
		if (err){
			console.log(err);
		}else{
			var data = qResult.rows[0].row_to_json;
			res.render('map', {
				title: 'Variance Earth',
				jsonData: data
			});

		};
	});
});





// Test out the database
router.get('/data', function(req, res){
	const client = new Client(conString);

	client.connect();

	client.query(coffeeQuery, (err, qres)=>{
		if (err) {
		    console.log(err.stack);
		} else {
		    res.send(qres.rows[0].row_to_json);
		    client.end();
			res.end();
		};

	});
});

module.exports = router;
