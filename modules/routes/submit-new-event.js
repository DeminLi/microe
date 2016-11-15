var event = require("../event/event");
var redis = require("../db/redis-client");
let async = require('async');

var db = new redis();
module.exports = function(req, res) {
	let title = req.body.eventTitle;
	let location = req.body.eventLocation;
	let time = req.body.eventTime;
	let detail = req.body.eventDetail;
	async.waterfall([
			function(cb)
			{
				generateId(function(id)
					{
						cb(null, id);
					});
			},
			function(id, cb)
			{
				createEvent(id, title, location, time, detail, function(newEvent)
					{
						cb(null, id);
					});
			}
		], function(err, id)
			{
				res.redirect("/event/" + id);
			});
}


function generateId(callback)
{
	db.getCurId(function (curId)
		{
			curId++;
			callback(curId);
		});
}

function createEvent(id, title, location, time, detail, callback)
{
	async.parallel(
	{
		id: function(cb)
		{
			db.setCurId(id, function() 
				{
					cb(null, id);
				});
		},
		newEvent: function(cb)
		{
			var newEvent = new event(id, title, location, time, detail);
			db.createEvent(newEvent, function()
				{
					cb(null, newEvent);
				});
		}
	}, function(err, res)
	{
		callback(res.newEvent);
	})
}