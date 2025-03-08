## Installation

```bash
# Clone the repository
git clone [repository-url]
cd midi-controller

# Install dependencies
npm install
```

## Development

```bash
# Start the application in development mode
npm run dev

# Run tests
npm test

# Build the application
npm run build
```

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- A MIDI input device

## Features

- 🎹 MIDI device support
  - Input and output capabilities
  - Note sending/receiving
  - Automatic device detection and selection
  - Robust error handling
  - Connection management
  - Hot-plugging support
    - Automatic device detection
    - Connection/disconnection notifications
    - Graceful handling of device removal
    - Automatic reconnection support
- 🎯 Multiple trigger types (velocity, hold, toggle)
- ⏱️ Configurable delays and timing
- 🖥️ Application launching/focusing
- 📟 Terminal command execution
- ⌨️ Key mapping simulation
- 📊 Real-time MIDI monitoring
  - Note detection with velocity
  - Active notes display
  - MIDI event history
  - Note names and numbers
  - MIDI channel information

## Usage

### MIDI Monitor

The MIDI monitor displays:
- Currently active notes
- Note velocity values
- Recent MIDI event history
- Note names and numbers
- MIDI channel information 

## Troubleshooting

### Common Issues

1. **MIDI Device Not Detected**
   - Ensure device is connected before launching app
   - Check system MIDI settings
   - Verify device drivers are installed
   - Check error messages in MIDI monitor

2. **Actions Not Triggering**
   - Verify MIDI input is being received
   - Check mapping configuration
   - Confirm trigger thresholds
   - Review MIDI monitor for correct note detection 