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
    	detail: function(cb) 
    	{ 
    		db.getEventDetail(id, function (detailRes)
    		{
    			cb(null, detailRes);
    		})
    	},
        location: function(cb) 
        { 
            db.getEventLocation(id, function (locRes)
            {
                cb(null, locRes);
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
		let newEvent = new event(id, res.title, res.location, res.time, res.detail);
		callback(newEvent);
	});
}