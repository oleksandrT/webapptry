var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var request = require('request');
var path = require('path');
var router = express.Router();

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/images/favicon.ico'))

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', '.hbs');

app.engine('.hbs', exphbs({extname: '.hbs'}));

app.set('views', __dirname + '/public/views');

router.get('/', function(req, res) {
	//res.send('<h1>Hello world</h1>');
	res.render('app-shell');
});

router.get('/results', function(req, res) {
	var lat = req.query.lat;
	var long = req.query.long;
	var url = 'https://developers.zomato.com/api/v2.1/search?count=10&lat=' + lat + '&lon=' + long +  '&radius=2000&cuisines=177&sort=real_distance&order=asc';

	var options = {
	    url : url,
	    headers: {'user-key':'7f649d32c4bb4eae5a4aa828451a7137'},
	    gzip:true
  	};

	function shortenString(arr, string){
	    if (string.length > 25) {
	      return arr.string = string.substr(0, 24) + "..";
	    } else {
	      return arr.string = string;
	    }
	}

    function checkRestaurants(object) {
	    if (object.length === 0) {

	      res.render('partials/no-restaurants');

	    } else {

	      var results = object.map(function(obj){
	        var arr = {};

	        var name = obj.restaurant.name;
	        arr.name = shortenString(arr, name);

	        arr.currency = obj.restaurant.currency;
	        arr.cost_for_two = obj.restaurant.average_cost_for_two;

	        var location = obj.restaurant.location.locality;
	        arr.location = shortenString(arr, location);

	        arr.lat = obj.restaurant.location.latitude;
	        arr.long = obj.restaurant.location.longitude;

	        arr.rating = obj.restaurant.user_rating.aggregate_rating;
	        arr.thumb = obj.restaurant.thumb;

	        if (arr.thumb.length === 0) {
	          arr.thumb = "images/img-placeholder.svg";
	        }

	        return arr;
	      });

	      res.render('partials/results', {filtered:results});
	    }
    }

    request(options, function(err, response, body){

	    if(!err && response.statusCode === 200) {
	      var respObj = JSON.parse(body);
	      var restaurants = respObj.restaurants;

	      checkRestaurants(restaurants);

	    } else {
	      console.log(error);
	    }
    });
});

app.use('/', router);

app.set('port', (process.env.PORT || 5000));

// app.listen(5000);


// console.log("App is running, server listening on port 5000");

app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});