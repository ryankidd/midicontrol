const { app, BrowserWindow, ipcMain } = require('electron');
const midi = require('@julusian/midi');

// Then continue using the API as before:
const input = new midi.Input();
const output = new midi.Output();

class MidiController {
  constructor() {
    this.mappings = new Map();
    this.input = new midi.Input();
    this.output = new midi.Output();
    this.activeHolds = new Map();
    this.toggleStates = new Map();
    this.activeNotes = new Map();
    this.window = null; // Will store the Electron window reference
    
    // Track output port
    this.currentOutputPort = null;
    this.devicePollInterval = null;
    this.lastDeviceList = [];
    
    this.input.on('message', (deltaTime, message) => {
      this.handleMidiMessage(message);
      this.updateMonitor(message);
    });

    // Add error handling
    this.input.on('error', (err) => {
      console.error('MIDI Error:', err);
      if (this.window) {
        this.window.webContents.send('midi-error', err.message);
      }
    });

    this.scanDevices();
    this.startDevicePolling();

    // Handle device selection from renderer
    ipcMain.on('select-device', (event, deviceId) => {
      const success = this.connectToDevice(deviceId);
      // Try to open the same port for output
      if (success) {
        this.connectOutputDevice(deviceId);
      }
      event.reply('device-connected', success);
    });

    // Handle MIDI output messages from renderer
    ipcMain.on('send-midi', (event, { type, channel, note, velocity }) => {
      this.sendMIDIMessage(type, channel, note, velocity);
    });
  }

  setWindow(window) {
    this.window = window;
  }

  updateMonitor(message) {
    const [command, note, velocity] = message;
    const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
    const isNoteOff = (command & 0xf0) === 0x80 || ((command & 0xf0) === 0x90 && velocity === 0);
    const channel = command & 0x0f;
    
    // Convert MIDI note number to note name
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    const noteName = noteNames[note % 12] + octave;

    const event = {
      type: isNoteOn ? 'Note On' : isNoteOff ? 'Note Off' : 'Other',
      note: noteName,
      noteNumber: note,
      velocity,
      channel: channel + 1,
      timestamp: Date.now()
    };

    // Keep track of active notes
    if (isNoteOn) {
      this.activeNotes.set(note, event);
    } else if (isNoteOff) {
      this.activeNotes.delete(note);
    }

    // Send update to renderer process
    if (this.window) {
      this.window.webContents.send('midi-event', {
        event,
        activeNotes: Array.from(this.activeNotes.values())
      });
    }
  }

  handleMidiMessage(message) {
    const [command, note, velocity] = message;
    const mappingKey = `${command}-${note}`;
    const mapping = this.mappings.get(mappingKey);
    
    if (mapping) {
      this.handleTrigger(mappingKey, mapping, velocity);
    }
  }

  handleTrigger(mappingKey, mapping, velocity) {
    const { trigger } = mapping;

    switch (trigger.type) {
      case 'velocity':
        if (velocity >= trigger.threshold) {
          this.executeWithDelay(mapping, velocity);
        }
        break;

      case 'hold':
        if (velocity > 0) {
          // Start hold timer
          this.activeHolds.set(mappingKey, setTimeout(() => {
            this.executeWithDelay(mapping, velocity);
          }, trigger.duration));
        } else {
          // Clear hold timer if key released
          const holdTimer = this.activeHolds.get(mappingKey);
          if (holdTimer) {
            clearTimeout(holdTimer);
            this.activeHolds.delete(mappingKey);
          }
        }
        break;

      case 'toggle':
        if (velocity > 0) {
          const currentState = this.toggleStates.get(mappingKey) || false;
          this.toggleStates.set(mappingKey, !currentState);
          
          if (!currentState) { // Only execute on toggle ON
            this.executeWithDelay(mapping, velocity);
          }
        }
        break;
    }
  }

  executeWithDelay(mapping, velocity) {
    if (mapping.trigger.delay > 0) {
      setTimeout(() => {
        this.executeAction(mapping, velocity);
      }, mapping.trigger.delay);
    } else {
      this.executeAction(mapping, velocity);
    }
  }

  executeAction(mapping, velocity) {
    switch (mapping.type) {
      case 'application':
        // Launch or focus application
        break;
      case 'terminal':
        // Execute terminal command
        break;
      case 'keypress':
        // Simulate keyboard input
        break;
    }
  }

  // Add cleanup method
  cleanup() {
    if (this.devicePollInterval) {
      clearInterval(this.devicePollInterval);
    }
    if (this.input) {
      this.input.closePort();
      this.input.destroy();
    }
    if (this.output) {
      this.output.closePort();
      this.output.destroy();
    }
  }

  // Add device connection method
  connectToDevice(portNumber) {
    try {
      if (this.input.isPortOpen()) {
        this.input.closePort();
      }
      this.input.openPort(portNumber);
      console.log(`Connected to MIDI device: ${this.input.getPortName(portNumber)}`);
      return true;
    } catch (err) {
      console.error('Failed to connect to MIDI device:', err);
      return false;
    }
  }

  connectOutputDevice(portNumber) {
    try {
      if (this.output.isPortOpen()) {
        this.output.closePort();
      }
      this.output.openPort(portNumber);
      this.currentOutputPort = portNumber;
      console.log(`Connected to MIDI output device: ${this.output.getPortName(portNumber)}`);
      return true;
    } catch (err) {
      console.error('Failed to connect to MIDI output device:', err);
      return false;
    }
  }

  sendMIDIMessage(type, channel, note, velocity) {
    if (!this.output.isPortOpen()) {
      console.error('No MIDI output port open');
      return false;
    }

    try {
      const status = (type === 'noteOn' ? 0x90 : 0x80) + (channel - 1);
      this.output.sendMessage([status, note, velocity]);
      return true;
    } catch (err) {
      console.error('Failed to send MIDI message:', err);
      return false;
    }
  }

  scanDevices() {
    const devices = [];
    const portCount = this.input.getPortCount();
    const outputPortCount = this.output.getPortCount();
    
    for (let i = 0; i < portCount; i++) {
      devices.push({
        id: i,
        name: this.input.getPortName(i),
        hasOutput: i < outputPortCount && this.output.getPortName(i) === this.input.getPortName(i)
      });
    }

    if (this.window) {
      this.window.webContents.send('midi-devices', devices);
    }

    return devices;
  }

  startDevicePolling() {
    // Poll for device changes every 2 seconds
    this.devicePollInterval = setInterval(() => {
      const currentDevices = this.scanDevices();
      
      // Check for new devices
      currentDevices.forEach(device => {
        const existingDevice = this.lastDeviceList.find(d => d.name === device.name);
        if (!existingDevice) {
          console.log('New MIDI device detected:', device.name);
          if (this.window) {
            this.window.webContents.send('device-added', device);
          }
        }
      });
      
      // Check for removed devices
      this.lastDeviceList.forEach(device => {
        const stillExists = currentDevices.find(d => d.name === device.name);
        if (!stillExists) {
          console.log('MIDI device removed:', device.name);
          if (this.window) {
            this.window.webContents.send('device-removed', device);
          }
        }
      });
      
      this.lastDeviceList = currentDevices;
    }, 2000);
  }
}

// In the main process setup:
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const midiController = new MidiController();
  midiController.setWindow(mainWindow);
  
  mainWindow.loadFile('src/index.html');

  // Cleanup on app quit
  app.on('before-quit', () => {
    midiController.cleanup();
  });
}); 