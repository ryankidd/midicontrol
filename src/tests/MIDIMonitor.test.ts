import { MIDIMonitor } from '../renderer/MIDIMonitor';
import { MIDIEvent, MIDIMonitorData } from '../types/midi';

describe('MIDIMonitor', () => {
  let monitor: MIDIMonitor;
  let currentNoteDiv: HTMLElement;
  let historyDiv: HTMLElement;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="currentNote"></div>
      <div id="midiHistory"></div>
    `;
    
    currentNoteDiv = document.getElementById('currentNote')!;
    historyDiv = document.getElementById('midiHistory')!;
    monitor = new MIDIMonitor();
  });

  describe('updateDisplay', () => {
    const mockEvent: MIDIEvent = {
      type: 'Note On',
      note: 'C4',
      noteNumber: 60,
      velocity: 100,
      channel: 1,
      timestamp: Date.now()
    };

    const mockData: MIDIMonitorData = {
      event: mockEvent,
      activeNotes: [mockEvent]
    };

    it('should update current notes display', () => {
      monitor.updateDisplay(mockData);
      expect(currentNoteDiv.innerHTML).toContain('C4');
      expect(currentNoteDiv.innerHTML).toContain('100');
    });

    it('should update history display', () => {
      monitor.updateDisplay(mockData);
      expect(historyDiv.innerHTML).toContain('C4');
      expect(historyDiv.innerHTML).toContain('Note On');
    });

    it('should limit history to MAX_HISTORY items', () => {
      // Update 12 times (MAX_HISTORY is 10)
      for (let i = 0; i < 12; i++) {
        monitor.updateDisplay({
          event: { ...mockEvent, noteNumber: i },
          activeNotes: []
        });
      }

      const historyItems = historyDiv.querySelectorAll('.midi-event');
      expect(historyItems.length).toBe(10);
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      monitor.showError('Test error');
      expect(currentNoteDiv.innerHTML).toContain('Test error');
      expect(currentNoteDiv.innerHTML).toContain('text-midi-error');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner', () => {
      monitor.setLoading(true);
      expect(currentNoteDiv.innerHTML).toContain('animate-spin');
    });
  });
}); 