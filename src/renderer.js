const { ipcRenderer } = require('electron');

// Keep track of the last few events for history
const MAX_HISTORY = 10;
const midiHistory = [];

// Add UI interaction handling
document.getElementById('triggerType').addEventListener('change', (e) => {
  const velocitySettings = document.querySelector('.velocity-setting');
  const holdSettings = document.querySelector('.hold-setting');
  
  switch (e.target.value) {
    case 'velocity':
      velocitySettings.classList.remove('hidden');
      holdSettings.classList.add('hidden');
      break;
    case 'hold':
      velocitySettings.classList.add('hidden');
      holdSettings.classList.remove('hidden');
      break;
    case 'toggle':
      velocitySettings.classList.add('hidden');
      holdSettings.classList.add('hidden');
      break;
  }
});

// Update the monitor display with Tailwind classes
function updateMonitorDisplay(data) {
  const { event, activeNotes } = data;
  
  const currentNoteDiv = document.getElementById('currentNote');
  if (activeNotes.length > 0) {
    const notesList = activeNotes
      .map(n => `<span class="text-midi-accent">${n.note}</span> (vel: ${n.velocity})`)
      .join(', ');
    currentNoteDiv.innerHTML = `Active Notes: ${notesList}`;
  } else {
    currentNoteDiv.innerHTML = 'No active notes';
  }

  const historyDiv = document.getElementById('midiHistory');
  midiHistory.unshift(event);
  if (midiHistory.length > MAX_HISTORY) {
    midiHistory.pop();
  }

  historyDiv.innerHTML = midiHistory
    .map(e => `
      <div class="midi-event bg-gray-50 p-2 rounded">
        <span class="text-gray-500">${new Date(e.timestamp).toLocaleTimeString()}</span>: 
        <span class="text-midi-accent">${e.type}</span> - 
        Note: ${e.note} (${e.noteNumber}) 
        Channel: ${e.channel} 
        Velocity: ${e.velocity}
      </div>
    `)
    .join('');
}

// Listen for MIDI events from the main process
ipcRenderer.on('midi-event', (event, data) => {
  updateMonitorDisplay(data);
});

// Update error handling with Tailwind classes
ipcRenderer.on('midi-error', (event, message) => {
  const currentNoteDiv = document.getElementById('currentNote');
  currentNoteDiv.innerHTML = `<span class="text-midi-error">Error: ${message}</span>`;
});

// Update loading state with Tailwind classes
function setLoadingState(isLoading) {
  const currentNoteDiv = document.getElementById('currentNote');
  if (isLoading) {
    currentNoteDiv.innerHTML = `
      <div class="flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3 text-midi-accent" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting to MIDI device...
      </div>
    `;
  }
}

// Handle MIDI device selection
ipcRenderer.on('midi-devices', (event, devices) => {
  updateDeviceList(devices);
});

function updateDeviceList(devices) {
  const select = document.getElementById('midiDeviceSelect');
  const currentValue = select.value;
  select.innerHTML = `
    <option value="">Select MIDI Device</option>
    ${devices.map(device => `
      <option value="${device.id}" ${device.id.toString() === currentValue ? 'selected' : ''}>
        ${device.name}${device.hasOutput ? ' (I/O)' : ' (Input Only)'}
      </option>
    `).join('')}
  `;
}

// Handle device hot-plugging
ipcRenderer.on('device-added', (event, device) => {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-midi-success text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500';
  notification.textContent = `New MIDI device detected: ${device.name}`;
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
});

ipcRenderer.on('device-removed', (event, device) => {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-midi-error text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500';
  notification.textContent = `MIDI device disconnected: ${device.name}`;
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);

  // If this was the currently selected device, show error in monitor
  const select = document.getElementById('midiDeviceSelect');
  if (select.value === device.id.toString()) {
    const currentNoteDiv = document.getElementById('currentNote');
    currentNoteDiv.innerHTML = `<span class="text-midi-error">Device disconnected: ${device.name}</span>`;
  }
});

document.getElementById('midiDeviceSelect').addEventListener('change', (e) => {
  const deviceId = parseInt(e.target.value);
  if (!isNaN(deviceId)) {
    setLoadingState(true);
    ipcRenderer.send('select-device', deviceId);
  }
});

// Handle connection result
ipcRenderer.on('device-connected', (event, success) => {
  setLoadingState(false);
  if (!success) {
    const currentNoteDiv = document.getElementById('currentNote');
    currentNoteDiv.innerHTML = `<span class="text-midi-error">Failed to connect to device</span>`;
  }
});

// Add MIDI output controls
function createMIDIOutputControls() {
  const container = document.createElement('div');
  container.className = 'bg-white rounded-lg shadow p-6 mb-6';
  container.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">MIDI Output</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Channel (1-16)
        </label>
        <input type="number" 
               id="outputChannel" 
               min="1" 
               max="16" 
               value="1"
               class="input-field w-full">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Note (0-127)
        </label>
        <input type="number" 
               id="outputNote" 
               min="0" 
               max="127" 
               value="60"
               class="input-field w-full">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Velocity (0-127)
        </label>
        <input type="number" 
               id="outputVelocity" 
               min="0" 
               max="127" 
               value="64"
               class="input-field w-full">
      </div>
      <div class="flex items-end">
        <button id="sendNote" 
                class="btn btn-primary w-full"
                aria-label="Send MIDI Note">
          Send Note
        </button>
      </div>
    </div>
  `;

  document.querySelector('main').insertBefore(
    container,
    document.querySelector('.mapping-form').parentElement
  );

  // Add event listener for the send button
  document.getElementById('sendNote').addEventListener('click', () => {
    const channel = parseInt(document.getElementById('outputChannel').value);
    const note = parseInt(document.getElementById('outputNote').value);
    const velocity = parseInt(document.getElementById('outputVelocity').value);

    // Send note on
    ipcRenderer.send('send-midi', {
      type: 'noteOn',
      channel,
      note,
      velocity
    });

    // Send note off after 100ms
    setTimeout(() => {
      ipcRenderer.send('send-midi', {
        type: 'noteOff',
        channel,
        note,
        velocity: 0
      });
    }, 100);
  });
}

// Call this after the DOM is loaded
document.addEventListener('DOMContentLoaded', createMIDIOutputControls); 