var event = require("../event/event");
var redis = require("../db/redis-client");
var async = require('async')
var wechat = require('../wechat.js');

var db = new redis();
module.exports = function(req, res)
{
    let id = req.params.id;
    async.parallel(
    {
        event: function(cb) 
        {
            getEventMetadata(id, function(eventRes)
            {
                cb(null, eventRes);
            });
        },
        wechatData: function(cb)
        {
            let url = req.protocol + '://' + req.hostname + req.originalUrl;;
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
        res.render('pages/event',
            {
                event: event,
                wechatData: wechatData
            })
    })
}

function getEventMetadata(id, callback)
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