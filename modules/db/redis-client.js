var redis = require('redis');
var async = require('async');

client = function()
{
	this.createEvent = function(event, callback)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		client.multi()
		.hset("event-title", event.id, event.title, redis.print)
		.hset("event-description", event.id, event.description, redis.print)
		.hset("event-time", event.id, event.time, redis.print)
		.exec(function () { });
		client.quit();
	}

	this.getCurId = function (callback)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		client.get("cur-id", function (err, value)
		{
			callback(value);
		})
		client.quit();
	}

	this.setCurId = function (id)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		client.set("cur-id", id);
		client.quit();
	}

	this.getAllEvents = function (callback)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		async.parallel(
		{
			titles: function(cb)
			{
				client.hgetall('event-title', function(err, titles)
				{
					cb(null, titles);
				})
			},
			descriptions: function(cb)
			{
				client.hgetall('event-description', function(err, descriptions)
				{
					cb(null, descriptions);
				})
			},
			times: function(cb)
			{
				client.hgetall('event-time', function(err, times)
				{
					cb(null, times);
				})
			}
		}, function(err, res)
		{
			let titles = res.titles;
			let dess = res.descriptions;
			let times = res.times;
			let ids = Object.keys(titles);
			events = [];
			async.each(ids, function(id, cb)
			{
				let title = titles[id];
				let des = dess[id];
				let time = times[id];
				events.push(new event(id, title, des, time));
			}, function(err)
			{
			});
			callback(events);
		})
		client.quit();
	}

	this.getEventTitle = function (id, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.hget("event-title", id, function (err, title)
		{
			callback(title);
		})
		client.quit();
	}

	this.getEventDes = function (id, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.hget("event-description", id, function (err, des)
		{
			callback(des);
		})
		client.quit();
	}

	this.getEventTime = function (id, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.hget("event-time", id, function (err, time)
		{
			callback(time);
		})
		client.quit();
	}
}

module.exports = client;