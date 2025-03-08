import { MIDIDeviceManager } from '../renderer/MIDIDeviceManager';
import { ipcRenderer } from 'electron';
import { MIDIDevice } from '../types/midi';

jest.mock('electron');

describe('MIDIDeviceManager', () => {
  let manager: MIDIDeviceManager;
  let deviceSelect: HTMLSelectElement;
  const mockOnDeviceChange = jest.fn();

  beforeEach(() => {
    document.body.innerHTML = '<select id="midiDeviceSelect"></select>';
    deviceSelect = document.getElementById('midiDeviceSelect') as HTMLSelectElement;
    manager = new MIDIDeviceManager(mockOnDeviceChange);
    jest.clearAllMocks();
  });

  describe('device selection', () => {
    it('should handle device selection', () => {
      deviceSelect.value = '1';
      deviceSelect.dispatchEvent(new Event('change'));

      expect(mockOnDeviceChange).toHaveBeenCalledWith(1);
      expect(ipcRenderer.send).toHaveBeenCalledWith('select-device', 1);
    });

    it('should not trigger for invalid device id', () => {
      deviceSelect.value = 'invalid';
      deviceSelect.dispatchEvent(new Event('change'));

      expect(mockOnDeviceChange).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });
  });

  describe('device list updates', () => {
    const mockDevices: MIDIDevice[] = [
      { id: 1, name: 'Device 1', hasOutput: true },
      { id: 2, name: 'Device 2', hasOutput: false }
    ];

    it('should update device list', () => {
      manager.updateDeviceList(mockDevices);
      
      const options = deviceSelect.querySelectorAll('option');
      expect(options.length).toBe(3); // Including default option
      expect(options[1].value).toBe('1');
      expect(options[1].textContent).toContain('Device 1');
      expect(options[1].textContent).toContain('(I/O)');
      expect(options[2].textContent).toContain('(Input Only)');
    });
  });

  describe('device events', () => {
    const mockDevice: MIDIDevice = { id: 1, name: 'Test Device', hasOutput: true };

    it('should handle device added', () => {
      manager.handleDeviceAdded(mockDevice);
      const notification = document.querySelector('.bg-midi-success');
      expect(notification).toBeInTheDocument();
      expect(notification?.textContent).toContain('Test Device');
    });

    it('should handle device removed', () => {
      deviceSelect.value = '1';
      manager.handleDeviceRemoved(mockDevice);
      
      expect(mockOnDeviceChange).toHaveBeenCalledWith(null);
      const notification = document.querySelector('.bg-midi-error');
      expect(notification).toBeInTheDocument();
      expect(notification?.textContent).toContain('Test Device');
    });
  });
}); 