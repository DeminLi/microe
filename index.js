var express = require('express');
var bodyParser = require('body-parser')
let async = require('async');
var submitNewEvent = require('./modules/routes/new-event-submit');
var getEvent = require('./modules/routes/event-get');
var redis = require("./modules/db/redis-client");
var wechat = require('./modules/wechat.js');

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

app.post('/getsignature', getSignature);
function getSignature(req, res) {
    var url = req.body.url;
    console.log(url);
    let config = 
    {
    	appId: 'wx60703c90d22b4232',
    	appSecret: '74bb55d2bda7d6a9598e4f5153043f25'
    }
    wechat(config, url, function(error, result) {
        if (error) {
            res.json({
                'error': error
            });
        } else {
        	console.log(result);
            res.json(result);
        }
    });
}

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
	async.parallel(
	{
		event: function(cb) 
		{
			getEvent(id, function(eventRes)
			{
				cb(null, eventRes);
			});
		},
		wechatData: function(cb)
		{
			let url = req.protocol + '://' + req.host + req.originalUrl;;
    			let config = 
    			{
    				appId: 'wx60703c90d22b4232',
    				appSecret: '74bb55d2bda7d6a9598e4f5153043f25'
    			}
    			wechat(config, url, function(error, data) {
        			if (error) {
            				cb(null, {
                				'error': error
            				});
        			} else {
            				cb(null, data);
        			}
    		});

		}
	}, function(err, result)
	{
		let event = result.event;
		let wechatData = result.wechatData;
		//console.log(wechatData);
		res.render('pages/event',
			{
				event: event,
				wechatData: wechatData
			})
	})
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
