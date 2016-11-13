var express = require('express');
var bodyParser = require('body-parser')
var submitNewEvent = require('./modules/routes/new-event-submit');
var getEvent = require('./modules/routes/event-get');
var redis = require("./modules/db/redis-client");
var app = express();
var db = new redis();

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
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

app.post('/new-event-submit', function(req, res) {
	let title = req.body.eventTitle;
	let location = req.body.eventLocation;
	let time = req.body.eventTime;
	let detail = req.body.eventDetail;
  	submitNewEvent(title, location, time, detail);
  	res.redirect("/");
});

app.get('/event/:id', function(req, res)
{
	let id = req.params.id;
	getEvent(id, function(event)
		{
			res.render('pages/event',
			{
				title: event.title,
				location: event.location,
				detail: event.detail,
				time: event.time
			})
		});
})

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