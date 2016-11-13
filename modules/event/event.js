event = function (id, title, location, time, detail)
{
	this.id = id;
	this.title = title;
	this.location = location;
	this.detail = detail;
	this.time = time;
}

module.exports = event;