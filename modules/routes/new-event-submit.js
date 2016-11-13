var event = require("../event/event");
var redis = require("../db/redis-client");

var db = new redis();
module.exports = function(title, location, time, detail)
{
	function generateId(callback)
	{
		db.getCurId(function (curId)
			{
				curId++;
				callback(curId);
				db.setCurId(curId);
			});
	}
	
	generateId(function (id) 
		{
			var newEvent = new event(id, title, location, time, detail);
			db.createEvent(newEvent, null);
		});
}