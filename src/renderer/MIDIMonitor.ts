import { MIDIEvent, MIDIMonitorData } from '../types/midi';
import { UIComponents } from './components/UIComponents';

/**
 * Handles the display and management of MIDI monitoring information
 */
class MIDIMonitor {
  private readonly MAX_HISTORY: number = 10;
  private midiHistory: MIDIEvent[] = [];
  private currentNoteDiv: HTMLElement;
  private historyDiv: HTMLElement;

  constructor() {
    this.currentNoteDiv = document.getElementById('currentNote')!;
    this.historyDiv = document.getElementById('midiHistory')!;
  }

  /**
   * Updates the monitor display with new MIDI data
   * @param data - The MIDI event data to display
   */
  public updateDisplay(data: MIDIMonitorData): void {
    const { event, activeNotes } = data;
    this.updateCurrentNotes(activeNotes);
    this.updateHistory(event);
  }

  /**
   * Updates the display of currently active notes
   * @param activeNotes - Array of currently active MIDI notes
   */
  private updateCurrentNotes(activeNotes: MIDIEvent[]): void {
    if (activeNotes.length > 0) {
      const notesList = activeNotes
        .map(n => `<span class="text-midi-accent">${n.note}</span> (vel: ${n.velocity})`)
        .join(', ');
      this.currentNoteDiv.innerHTML = `Active Notes: ${notesList}`;
    } else {
      this.currentNoteDiv.innerHTML = 'No active notes';
    }
  }

  /**
   * Updates the MIDI event history display
   * @param event - New MIDI event to add to history
   */
  private updateHistory(event: MIDIEvent): void {
    this.midiHistory.unshift(event);
    if (this.midiHistory.length > this.MAX_HISTORY) {
      this.midiHistory.pop();
    }

    this.historyDiv.innerHTML = this.midiHistory
      .map(e => this.createHistoryEventHTML(e))
      .join('');
  }

  /**
   * Creates HTML representation of a MIDI event
   * @param event - MIDI event to display
   * @returns HTML string representing the event
   */
  private createHistoryEventHTML(event: MIDIEvent): string {
    return `
      <div class="midi-event bg-gray-50 p-2 rounded">
        <span class="text-gray-500">${new Date(event.timestamp).toLocaleTimeString()}</span>: 
        <span class="text-midi-accent">${event.type}</span> - 
        Note: ${event.note} (${event.noteNumber}) 
        Channel: ${event.channel} 
        Velocity: ${event.velocity}
      </div>
    `;
  }

  /**
   * Displays an error message in the monitor
   * @param message - Error message to display
   */
  public showError(message: string): void {
    this.currentNoteDiv.innerHTML = `<span class="text-midi-error">Error: ${message}</span>`;
  }

  /**
   * Sets the loading state of the monitor
   * @param isLoading - Whether the monitor should show loading state
   */
  public setLoading(isLoading: boolean): void {
    if (isLoading) {
      this.currentNoteDiv.innerHTML = UIComponents.createLoadingSpinner();
    }
  }
}

export { MIDIMonitor }; 