import { UIComponents } from '../renderer/components/UIComponents';

describe('UIComponents', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createNotification', () => {
    it('should create success notification', () => {
      UIComponents.createNotification('Test message', 'success');
      
      const notification = document.querySelector('.bg-midi-success');
      expect(notification).toBeInTheDocument();
      expect(notification?.textContent).toBe('Test message');
    });

    it('should create error notification', () => {
      UIComponents.createNotification('Error message', 'error');
      
      const notification = document.querySelector('.bg-midi-error');
      expect(notification).toBeInTheDocument();
      expect(notification?.textContent).toBe('Error message');
    });

    it('should remove notification after timeout', () => {
      UIComponents.createNotification('Test message');
      const notification = document.querySelector('.bg-midi-success');
      
      jest.advanceTimersByTime(3000);
      expect(notification?.style.opacity).toBe('0');
      
      jest.advanceTimersByTime(500);
      expect(notification).not.toBeInTheDocument();
    });
  });

  describe('createLoadingSpinner', () => {
    it('should create loading spinner HTML', () => {
      const html = UIComponents.createLoadingSpinner();
      expect(html).toContain('animate-spin');
      expect(html).toContain('Connecting to MIDI device');
    });
  });

  describe('getMIDIOutputHTML', () => {
    it('should create MIDI output interface HTML', () => {
      const html = UIComponents.getMIDIOutputHTML();
      expect(html).toContain('MIDI Output');
      expect(html).toContain('grid-cols-1');
      expect(html).toContain('md:grid-cols-2');
    });
  });
}); 