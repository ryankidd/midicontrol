const { ipcRenderer } = require('electron');
const MIDIMonitor = require('./renderer/MIDIMonitor');
const MIDIDeviceManager = require('./renderer/MIDIDeviceManager');
const MIDIOutputController = require('./renderer/MIDIOutputController');
const UIComponents = require('./renderer/components/UIComponents');

class MIDIRenderer {
  constructor() {
    this.monitor = new MIDIMonitor();
    this.deviceManager = new MIDIDeviceManager(this.handleDeviceChange.bind(this));
    this.outputController = new MIDIOutputController();
    this.initializeIPCListeners();
  }

  initializeIPCListeners() {
    ipcRenderer.on('midi-event', (_, data) => this.monitor.updateDisplay(data));
    ipcRenderer.on('midi-error', (_, message) => this.monitor.showError(message));
    ipcRenderer.on('midi-devices', (_, devices) => this.deviceManager.updateDeviceList(devices));
    ipcRenderer.on('device-added', (_, device) => this.deviceManager.handleDeviceAdded(device));
    ipcRenderer.on('device-removed', (_, device) => this.deviceManager.handleDeviceRemoved(device));
    ipcRenderer.on('device-connected', (_, success) => this.handleConnectionResult(success));
  }

  handleDeviceChange(deviceId) {
    this.monitor.setLoading(deviceId !== null);
  }

  handleConnectionResult(success) {
    this.monitor.setLoading(false);
    if (!success) {
      this.monitor.showError('Failed to connect to device');
    }
  }
}

// Initialize the renderer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.midiRenderer = new MIDIRenderer();
}); 