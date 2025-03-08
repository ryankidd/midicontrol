import { ipcRenderer } from 'electron';
import { MIDIDevice } from '../types/midi';
import { UIComponents } from './components/UIComponents';

/**
 * Manages MIDI device selection and connection
 */
class MIDIDeviceManager {
  private deviceSelect: HTMLSelectElement;
  private onDeviceChange: (deviceId: number | null) => void;

  /**
   * @param onDeviceChange - Callback for device selection changes
   */
  constructor(onDeviceChange: (deviceId: number | null) => void) {
    this.deviceSelect = document.getElementById('midiDeviceSelect') as HTMLSelectElement;
    this.onDeviceChange = onDeviceChange;
    this.initializeEventListeners();
  }

  /**
   * Sets up event listeners for device selection
   */
  private initializeEventListeners(): void {
    this.deviceSelect.addEventListener('change', this.handleDeviceSelection.bind(this));
  }

  /**
   * Handles device selection changes
   * @param e - Selection change event
   */
  private handleDeviceSelection(e: Event): void {
    const deviceId = parseInt((e.target as HTMLSelectElement).value);
    if (!isNaN(deviceId)) {
      this.onDeviceChange(deviceId);
      ipcRenderer.send('select-device', deviceId);
    }
  }

  /**
   * Updates the device selection list
   * @param devices - Array of available MIDI devices
   */
  public updateDeviceList(devices: MIDIDevice[]): void {
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

  /**
   * Handles new device detection
   * @param device - Newly detected MIDI device
   */
  public handleDeviceAdded(device: MIDIDevice): void {
    UIComponents.createNotification(`New MIDI device detected: ${device.name}`, 'success');
  }

  /**
   * Handles device disconnection
   * @param device - Disconnected MIDI device
   */
  public handleDeviceRemoved(device: MIDIDevice): void {
    UIComponents.createNotification(`MIDI device disconnected: ${device.name}`, 'error');
    
    if (this.deviceSelect.value === device.id.toString()) {
      this.onDeviceChange(null);
    }
  }
}

export { MIDIDeviceManager }; 