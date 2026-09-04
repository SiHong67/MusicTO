import { Member, StationId, StationEvaluation, StudentSession } from '../types';
import { INITIAL_MEMBERS } from '../data/mockMembers';

const STORAGE_KEY = 'musicto_tryouts_members_v1';
const STUDENT_SESSION_KEY = 'musicto_student_session';
const CHANNEL_NAME = 'musicto_tryouts_sync';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Ignore if unsupported
}

export function getStoredMembers(): Member[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    const parsed: Member[] = JSON.parse(raw);
    // Ensure every member has a videos array, and inject sample videos if missing
    return parsed.map((m) => {
      const initial = INITIAL_MEMBERS.find((im) => im.id === m.id);
      const videos = m.videos && m.videos.length > 0 ? m.videos : initial?.videos || [];
      return {
        ...m,
        videos,
      };
    });
  } catch (err) {
    console.error('Failed to load members from localStorage', err);
    return INITIAL_MEMBERS;
  }
}

export function saveStoredMembers(members: Member[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    broadcastChannel?.postMessage({ type: 'MEMBERS_UPDATED', timestamp: Date.now() });
  } catch (err) {
    console.error('Failed to save members to localStorage', err);
  }
}

// --- Student Session Persistence (Stores the registered student on their phone) ---
export function getStoredStudentSession(): StudentSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STUDENT_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read student session', err);
  }
  return null;
}

export function saveStoredStudentSession(session: StudentSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STUDENT_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to save student session', err);
  }
}

export function clearStoredStudentSession(): void {
  saveStoredStudentSession(null);
}

// --- Real-time Multi-Device Server Synchronization ---

export async function fetchMembersFromServer(): Promise<Member[] | null> {
  try {
    const res = await fetch('/api/members');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.members)) {
        saveStoredMembers(data.members);
        return data.members;
      }
    }
  } catch (err) {
    // Silently fallback to local storage
  }
  return null;
}

export async function apiRegisterCandidate(member: Member): Promise<void> {
  try {
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
  } catch (err) {
    console.warn('Could not post candidate to server, local backup retained', err);
  }
}

export async function apiCheckinStation(memberId: string, stationId: StationId): Promise<void> {
  try {
    await fetch(`/api/members/${memberId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId }),
    });
  } catch (err) {
    console.warn('Could not post check-in to server, local backup retained', err);
  }
}

export async function apiSaveEvaluation(
  memberId: string,
  stationId: StationId,
  evaluation: StationEvaluation
): Promise<void> {
  try {
    await fetch(`/api/members/${memberId}/evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId, evaluation }),
    });
  } catch (err) {
    console.warn('Could not post evaluation to server, local backup retained', err);
  }
}

export async function apiResetData(defaultMembers?: Member[]): Promise<Member[]> {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.members)) {
        saveStoredMembers(data.members);
        return data.members;
      }
    }
  } catch {
    // fallback
  }
  const fallback = defaultMembers || INITIAL_MEMBERS;
  saveStoredMembers(fallback);
  return fallback;
}

export function subscribeToMemberUpdates(callback: (members: Member[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'MEMBERS_UPDATED') {
      callback(getStoredMembers());
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(getStoredMembers());
    }
  };

  broadcastChannel?.addEventListener('message', handleBroadcast);
  window.addEventListener('storage', handleStorage);

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

export function exportMembersToCSV(members: Member[]): void {
  const headers = [
    'ID',
    'Name',
    'Age',
    'CG',
    'Follow-up Status',
    'Current Station',
    'Scouted By Stations',
    'Drums Traffic Light',
    'Drums Remarks',
    'Vocals Traffic Light',
    'Vocals Remarks',
    'Bass Traffic Light',
    'Bass Remarks',
    'Guitars Traffic Light',
    'Guitars Remarks',
    'Keyboard Traffic Light',
    'Keyboard Remarks',
    'Sound Traffic Light',
    'Sound Remarks',
  ];

  const rows = members.map((m) => {
    const scoutedStations = Object.values(m.evaluations)
      .filter((e) => e?.scouted)
      .map((e) => e?.stationId)
      .join(', ');

    return [
      `"${m.id}"`,
      `"${m.name}"`,
      m.age,
      `"${m.cg}"`,
      `"${m.followUpStatus === 'finished' ? 'Finished Follow Up' : m.followUpStatus === 'not_started' ? 'Have Not Started' : 'Going Through Follow Up'}"`,
      `"${m.currentStation || ''}"`,
      `"${scoutedStations}"`,
      m.evaluations.drums?.trafficLight || '',
      `"${(m.evaluations.drums?.notes || '').replace(/"/g, '""')}"`,
      m.evaluations.vocals?.trafficLight || '',
      `"${(m.evaluations.vocals?.notes || '').replace(/"/g, '""')}"`,
      m.evaluations.bass?.trafficLight || '',
      `"${(m.evaluations.bass?.notes || '').replace(/"/g, '""')}"`,
      m.evaluations.guitars?.trafficLight || '',
      `"${(m.evaluations.guitars?.notes || '').replace(/"/g, '""')}"`,
      m.evaluations.keyboard?.trafficLight || '',
      `"${(m.evaluations.keyboard?.notes || '').replace(/"/g, '""')}"`,
      m.evaluations.sound?.trafficLight || '',
      `"${(m.evaluations.sound?.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MusicTO_Tryouts_Scouting_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
