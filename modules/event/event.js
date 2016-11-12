event = function (id, title, description, time)
{
	this.id = id;
	this.title = title;
	this.description = description;
	this.time = time;
	this.toString = function (callback)
	{
		var str = "title:" + title + " description:" + description
		callback(str);
	};
}

module.exports = event;