var event = require("../event/event");
var redis = require("../db/redis-client");

var db = new redis();
module.exports = function(title, description, time)
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
			var newEvent = new event(id, title, description, time);
			db.createEvent(newEvent, null);
		});
}