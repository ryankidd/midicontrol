class MIDIMonitor {
  constructor() {
    this.MAX_HISTORY = 10;
    this.midiHistory = [];
    this.currentNoteDiv = document.getElementById('currentNote');
    this.historyDiv = document.getElementById('midiHistory');
  }

  updateDisplay(data) {
    const { event, activeNotes } = data;
    this.updateCurrentNotes(activeNotes);
    this.updateHistory(event);
  }

  updateCurrentNotes(activeNotes) {
    if (activeNotes.length > 0) {
      const notesList = activeNotes
        .map(n => `<span class="text-midi-accent">${n.note}</span> (vel: ${n.velocity})`)
        .join(', ');
      this.currentNoteDiv.innerHTML = `Active Notes: ${notesList}`;
    } else {
      this.currentNoteDiv.innerHTML = 'No active notes';
    }
  }

  updateHistory(event) {
    this.midiHistory.unshift(event);
    if (this.midiHistory.length > this.MAX_HISTORY) {
      this.midiHistory.pop();
    }

    this.historyDiv.innerHTML = this.midiHistory
      .map(e => this.createHistoryEventHTML(e))
      .join('');
  }

  createHistoryEventHTML(event) {
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

  showError(message) {
    this.currentNoteDiv.innerHTML = `<span class="text-midi-error">Error: ${message}</span>`;
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.currentNoteDiv.innerHTML = UIComponents.createLoadingSpinner();
    }
  }
}

module.exports = MIDIMonitor; 