# Arduino-api
Simple nodejs module to communicate with arduino using serial and Go server ([serial-port-json-server](https://github.com/johnlauer/serial-port-json-server)).

Thanks to [Johnlauer](https://github.com/johnlauer) for his awesome Go server.

# Install

Download and run https://github.com/johnlauer/serial-port-json-server :
```
./serial-port-json-server -v
```
Then install the module :
```
npm install arduino-api
```

# Usage

```javascript
var arduinoApi = require('arduino-api');	// call arduino-api
var API = arduinoApi();						// create our API
API.connect('ws://localhost:8989/ws');		// connect to Arduino
API.send({led : 255}},function(resp){       // send json to Arduino
  console.log(resp);                        // log response
});
```
