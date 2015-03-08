var Arduino = function(arduino) {
  this.name = arduino.Name;
  this.friendly = arduino.Friendly;
  this.isOpen = arduino.IsOpen;
  this.baud = arduino.Baud;
  this.RtsOn = arduino.RtsOn;
  this.DtrOn = arduino.DtrOn;
  this.bufferAlgorithm = arduino.BufferAlgorithm;
  this.availableAlgorithms = arduino.AvailableAlgorithms;
  this.ver = arduino.ver;
}

module.exports = Arduino;