var redis = require('redis');
var async = require('async');

client = function()
{
	this.createEvent = function(event, callback)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		client.multi()
		.hset("event-title", event.id, event.title)
		.hset("event-location", event.id, event.location)
		.hset("event-time", event.id, event.time)
		.hset("event-detail", event.id, event.detail)
		.exec(function () { });
		client.quit();
		callback();
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

	this.setCurId = function (id, callback)
	{
		var client = redis.createClient(process.env.REDIS_URL);
		client.set("cur-id", id);
		client.quit();
		callback();
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
			locations: function(cb)
			{
				client.hgetall('event-location', function(err, location)
				{
					cb(null, location);
				})
			},
			details: function(cb)
			{
				client.hgetall('event-detail', function(err, detail)
				{
					cb(null, detail);
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
			let ids = [];
			if(titles)
			{
				ids = Object.keys(titles);
			}

			let locations = res.locations;
			let times = res.times;
			let details = res.details;

			events = [];
			async.each(ids, function(id, cb)
			{
				let title = titles[id];
				let detail = details[id];
				let time = times[id];
				let location = locations[id];
				events.push(new event(id, title, location, time, detail));
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

	this.getEventDetail = function (id, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.hget("event-detail", id, function (err, detail)
		{
			callback(detail);
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

	this.getEventLocation = function (id, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.hget("event-location", id, function (err, location)
		{
			callback(location);
		})
		client.quit();
	}

	this.getTicket = function(callback)
	{
		let client =  redis.createClient(process.env.REDIS_URL);
		client.get('wechat-ticket', function (err, ticket)
		{
			callback(ticket);
		});
		client.quit();
	}

	this.updateTicket = function(ticket, callback)
	{
		let client = redis.createClient(process.env.REDIS_URL);
		client.multi()
		.set('wechat-ticket', ticket)
		.expire('wechat-ticket', 7188)
		.exec(function () {});
		client.quit();
	}
}

module.exports = client;