/*==========  REQUIRE  ==========*/

var WebSocket = require('ws');
var util = require('util');
var Arduino = require('./class/arduino');

/*==========  API  ==========*/

exports = module.exports = createApplication;

/* API constructor */

function createApplication() {
  var app = new API();
  return app;
}

/* API */

var API = function()
{
	this.arduino = undefined;
	this.respQueue = [];
	this.respData = "";
	this.enumStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
	this.ws = undefined;
	this.url = "";
};

/* Return object with states */

API.prototype.getState = function()
{
	if(this.ws !== undefined)
	{
		var res =  {
			open : (this.enumStates[this.ws.readyState] === "OPEN"),
			closed : (this.enumStates[this.ws.readyState] === "CLOSED"),
			connecting : (this.enumStates[this.ws.readyState] === "CONNECTING"),
			closing : (this.enumStates[this.ws.readyState] === "CLOSING")
		};
		return res;
	}
	var res2 = {
		open : false,
		closed : true,
		connecting : false,
		closing : false
	};
	return res2;
};

/* Connect to the first Arduino found */

API.prototype.connect = function(websocketurl)
{
	if(this.getState().open)
		return;

	var that = this;
	that.url = websocketurl;
	that.ws = new WebSocket(that.url);
	that.ws.on('open', function open() {
	  that.list();
	});
	that.ws.on('message', function(data, flags) {
	  // flags.binary will be set if a binary data is received.
	  // flags.masked will be set if the data was masked.
	  try{
      		var object = JSON.parse(data);
		    if(object.D !== undefined)
		    {
		    	that.respData += object.D;
		    	try
		    	{
		    		var response = JSON.parse(that.respData);
		    		var callback = that.respQueue.shift();
		    		callback(response);
		    		that.respData = "";
		    	}
		    	catch(e){
		    		//console.log(e);
		    	}
		    }

		    if(object.SerialPorts !== undefined && object.SerialPorts[0] !== undefined)
		    {
		        that.arduino = new Arduino(object.SerialPorts[0]);
		        if(that.arduino.isOpen === false)
		        {
		            that.open(115200,"default");
		        }
		        else
		        {
		        	that.arduino = new Arduino(object.SerialPorts[0]);
		        	console.log(util.format('Connected to %s on port %s', that.arduino.friendly, that.arduino.name));
		        }
		    }
		}catch(e){
			//console.log(e);
		}
	});
};

/* Send JSON to Arduino */

API.prototype.send = function(cmd,callback)
{
	if(this.arduino === undefined)
	{
		callback({err : util.format('Socket connected : %s, Arduino connected : %s',this.getState().open,false)});
		return;
	}
	if(this.arduino.isOpen && this.getState().open)
	{
		json = JSON.stringify(cmd).replace(/"/g, '\\"');
		var cmdStr = util.format('sendjson { "P": "%s", "Data": [ { "D": "%s", "ID" : "%s" } ] }',this.arduino.name,json,Date.now());
		this.ws.send(cmdStr);
		this.respQueue.push(callback);
		return;
	}
	else
	{
		callback({err : util.format('Socket connected : %s, Arduino connected : %s',this.getState().open,this.arduino.isOpen)});
		return;
	}
};

/* Open Serial COM with arduino */

API.prototype.open = function(baud,bufferAlgorithm)
{
	if(!this.arduino.isOpen && this.getState().open)
	{
		this.ws.send(util.format('open %s %s %s',this.arduino.name,baud,bufferAlgorithm));
		this.list();
	}
};

/* List all available Arduino */

API.prototype.list = function()
{
	if(this.getState().open)
		this.ws.send('list');
};

exports.connect = API.prototype.connect;
exports.send = API.prototype.send;
exports.getState = API.prototype.getState;