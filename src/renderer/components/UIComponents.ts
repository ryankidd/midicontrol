/**
 * Static utility class for UI components
 */
class UIComponents {
  /**
   * Creates and displays a notification
   * @param message - Notification message
   * @param type - Type of notification ('success' | 'error')
   */
  public static createNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 bg-midi-${type} text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  /**
   * Creates HTML for loading spinner
   * @returns HTML string for loading spinner
   */
  public static createLoadingSpinner(): string {
    return `
      <div class="flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3 text-midi-accent" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting to MIDI device...
      </div>
    `;
  }

  /**
   * Creates HTML for MIDI output controls
   * @returns HTML string for MIDI output interface
   */
  public static getMIDIOutputHTML(): string {
    return `
      <h2 class="text-lg font-semibold mb-4">MIDI Output</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- ... rest of the MIDI output HTML ... -->
      </div>
    `;
  }
}

export { UIComponents }; 