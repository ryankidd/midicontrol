const { ipcRenderer } = require('electron');
const UIComponents = require('./components/UIComponents');

class MIDIOutputController {
  constructor() {
    this.createControls();
    this.initializeEventListeners();
  }

  createControls() {
    const container = document.createElement('div');
    container.className = 'bg-white rounded-lg shadow p-6 mb-6';
    container.innerHTML = UIComponents.getMIDIOutputHTML();

    document.querySelector('main').insertBefore(
      container,
      document.querySelector('.mapping-form').parentElement
    );
  }

  initializeEventListeners() {
    document.getElementById('sendNote').addEventListener('click', () => {
      const channel = parseInt(document.getElementById('outputChannel').value);
      const note = parseInt(document.getElementById('outputNote').value);
      const velocity = parseInt(document.getElementById('outputVelocity').value);

      this.sendNote(channel, note, velocity);
    });
  }

  sendNote(channel, note, velocity) {
    this.sendMIDIMessage('noteOn', channel, note, velocity);
    
    setTimeout(() => {
      this.sendMIDIMessage('noteOff', channel, note, 0);
    }, 100);
  }

  sendMIDIMessage(type, channel, note, velocity) {
    ipcRenderer.send('send-midi', { type, channel, note, velocity });
  }
}

module.exports = MIDIOutputController; 