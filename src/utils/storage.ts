import { Member } from '../types';
import { INITIAL_MEMBERS } from '../data/mockMembers';

const STORAGE_KEY = 'musicto_tryouts_members_v1';
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
      `"${m.followUpStatus === 'finished' ? 'Finished Follow Up' : 'Going Through Follow Up'}"`,
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
