var event = require("../event/event");
var redis = require("../db/redis-client");
var async = require('async')

var db = new redis();
module.exports = function(id, callback)
{
	async.parallel(
	{
    	title: function(cb) 
    	{ 
    		db.getEventTitle(id, function (titleRes)
    		{
    			cb(null, titleRes);
    		})
    	},
    	description: function(cb) 
    	{ 
    		db.getEventDes(id, function (desRes)
    		{
    			cb(null, desRes);
    		})
    	},
    	time: function(cb) 
    	{
    		db.getEventTime(id, function (timeRes)
    		{
    			cb(null, timeRes);
    		})
    	}
	}, function (err, res) 
	{
		let newEvent = new event(id, res.title, res.description, res.time);
		callback(newEvent);
	});
}