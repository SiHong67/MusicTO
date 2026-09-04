export type StationId = 'drums' | 'vocals' | 'bass' | 'guitars' | 'keyboard' | 'sound';

export type TrafficLightRating = 'green' | 'yellow' | 'red';

export type FollowUpStatus = 'going_through' | 'finished';

export interface StationConfig {
  id: StationId;
  name: string;
  code: string;
  icon: string;
  description: string;
  color: string;
}

export interface PersonVideo {
  id: string;
  stationId: StationId;
  title?: string;
  url: string;
  type: 'upload' | 'link' | 'sample' | 'recording';
  createdAt: string;
  notes?: string;
}

export interface StationEvaluation {
  stationId: StationId;
  scouted: boolean;
  trafficLight?: TrafficLightRating;
  stars?: number; // 1 to 3
  notes: string;
  updatedAt: string;
  evaluatorName?: string;
}

export interface Member {
  id: string;
  name: string;
  age: number;
  cg: string; // e.g., 'AZ1', 'V1', 'V2', 'V3'
  followUpStatus: FollowUpStatus;
  primaryStation?: StationId;
  checkedInStations: StationId[];
  currentStation?: StationId;
  registeredAt: string;
  evaluations: Partial<Record<StationId, StationEvaluation>>;
  videos?: PersonVideo[];
}

export const STATIONS: StationConfig[] = [
  {
    id: 'drums',
    name: 'Drums',
    code: 'STATION-DRUMS',
    icon: 'Drum',
    description: 'Rhythm, pocket, timing, dynamics & groove',
    color: '#f87171',
  },
  {
    id: 'vocals',
    name: 'Vocals',
    code: 'STATION-VOCALS',
    icon: 'Mic',
    description: 'Pitch accuracy, tone, range & vocal control',
    color: '#fbbf24',
  },
  {
    id: 'bass',
    name: 'Bass',
    code: 'STATION-BASS',
    icon: 'Disc',
    description: 'Rhythm locking, tone, chord knowledge & feel',
    color: '#34d399',
  },
  {
    id: 'guitars',
    name: 'Guitars',
    code: 'STATION-GUITARS',
    icon: 'Guitar',
    description: 'Acoustic/Electric tone, strumming, lead & rhythm',
    color: '#60a5fa',
  },
  {
    id: 'keyboard',
    name: 'Keyboard',
    code: 'STATION-KEYBOARD',
    icon: 'Piano',
    description: 'Voicings, synth/piano patches, pads & tempo',
    color: '#a78bfa',
  },
  {
    id: 'sound',
    name: 'Sound',
    code: 'STATION-SOUND',
    icon: 'Volume2',
    description: 'Frequencies, mixing ear, routing & quick sense',
    color: '#38bdf8',
  },
];

export function getEvaluationsList(member: Member): StationEvaluation[] {
  const list: StationEvaluation[] = [];
  for (const key of Object.keys(member.evaluations) as StationId[]) {
    const val = member.evaluations[key];
    if (val) {
      list.push(val);
    }
  }
  return list;
}

