import '@testing-library/jest-dom';

// Mock HTML elements that should exist
document.body.innerHTML = `
  <div id="currentNote"></div>
  <div id="midiHistory"></div>
  <select id="midiDeviceSelect"></select>
  <main></main>
`; 