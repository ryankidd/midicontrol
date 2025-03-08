module.exports = {
  defaultMappings: {
    // Note numbers correspond to MIDI note values
    '144-60': { // Channel 1, note 60 (middle C)
      type: 'terminal',
      command: 'ls -la',
      description: 'List directory contents',
      trigger: {
        type: 'velocity',
        threshold: 64,
        delay: 0
      }
    },
    '144-61': {
      type: 'application',
      app: 'Chrome',
      description: 'Launch Chrome',
      trigger: {
        type: 'hold',
        duration: 1000,
        delay: 500
      }
    },
    '144-62': {
      type: 'terminal',
      command: 'npm run build',
      description: 'Build project',
      trigger: {
        type: 'toggle',
        delay: 200
      }
    }
  }
}; 


