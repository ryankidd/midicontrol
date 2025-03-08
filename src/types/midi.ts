export interface MIDIEvent {
  type: 'Note On' | 'Note Off' | 'Other';
  note: string;
  noteNumber: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

export interface MIDIDevice {
  id: number;
  name: string;
  hasOutput: boolean;
}

export interface MIDIMessage {
  type: 'noteOn' | 'noteOff';
  channel: number;
  note: number;
  velocity: number;
}

export interface MIDIMonitorData {
  event: MIDIEvent;
  activeNotes: MIDIEvent[];
} 