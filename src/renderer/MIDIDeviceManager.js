const { ipcRenderer } = require('electron');
const UIComponents = require('./components/UIComponents');

class MIDIDeviceManager {
  constructor(onDeviceChange) {
    this.deviceSelect = document.getElementById('midiDeviceSelect');
    this.onDeviceChange = onDeviceChange;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.deviceSelect.addEventListener('change', this.handleDeviceSelection.bind(this));
  }

  handleDeviceSelection(e) {
    const deviceId = parseInt(e.target.value);
    if (!isNaN(deviceId)) {
      this.onDeviceChange(deviceId);
      ipcRenderer.send('select-device', deviceId);
    }
  }

  updateDeviceList(devices) {
    const currentValue = this.deviceSelect.value;
    this.deviceSelect.innerHTML = `
      <option value="">Select MIDI Device</option>
      ${devices.map(device => `
        <option value="${device.id}" ${device.id.toString() === currentValue ? 'selected' : ''}>
          ${device.name}${device.hasOutput ? ' (I/O)' : ' (Input Only)'}
        </option>
      `).join('')}
    `;
  }

  handleDeviceAdded(device) {
    UIComponents.createNotification(`New MIDI device detected: ${device.name}`, 'success');
  }

  handleDeviceRemoved(device) {
    UIComponents.createNotification(`MIDI device disconnected: ${device.name}`, 'error');
    
    if (this.deviceSelect.value === device.id.toString()) {
      this.onDeviceChange(null);
    }
  }
}

module.exports = MIDIDeviceManager; 