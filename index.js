var express = require('express');
var bodyParser = require('body-parser')
var submitNewEvent = require('./modules/routes/submit-new-event');
var getEvent = require('./modules/routes/get-event');
var redis = require("./modules/db/redis-client");

var app = express();
var db = new redis();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
	{ 
		extended: true
	}));

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap'))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/new-event', function(request, response) {
  response.render('pages/new_event');
});

app.post('/new-event-submit', submitNewEvent);

app.get('/event/:id', getEvent)

app.get('/', function(request, response) {
	db.getAllEvents(function (events)
	{
  		response.render('pages/index',
  		{
  			events: events
  		});
	})
});

var server = app.listen(app.get('port'), function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Starting http://%s:%s", host, port)

})
