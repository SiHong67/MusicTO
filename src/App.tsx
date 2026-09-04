import React, { useState, useEffect } from 'react';
import {
  Member,
  StationId,
  StationEvaluation,
  STATIONS,
  ThemePreference,
  InstructorSession,
} from './types';
import {
  getStoredMembers,
  saveStoredMembers,
  subscribeToMemberUpdates,
  exportMembersToCSV,
} from './utils/storage';
import { INITIAL_MEMBERS } from './data/mockMembers';
import { HeaderNavigation, MainView } from './components/HeaderNavigation';
import { AllMembersView } from './components/AllMembersView';
import { StationModeView } from './components/StationModeView';
import { StationQRCard } from './components/StationQRCard';
import { EvaluationScreen } from './components/EvaluationScreen';
import { StationQRScannerModal } from './components/StationQRScannerModal';
import { CandidateRegistrationModal } from './components/CandidateRegistrationModal';
import { InstructorLockScreen } from './components/InstructorLockScreen';
import { Radio } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => getStoredMembers());
  const [currentView, setCurrentView] = useState<MainView>('members');
  const [activeStationId, setActiveStationId] = useState<StationId>('drums');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>('mem-1');

  // Theme state: default to 'dark' or persisted preference
  const [theme, setTheme] = useState<ThemePreference>(() => {
    try {
      const savedTheme = localStorage.getItem('musicto_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {}
    return 'dark';
  });

  // Instructor Authentication Session: Gate app access behind password 'musicto123'
  const [session, setSession] = useState<InstructorSession>(() => {
    try {
      const savedSession = localStorage.getItem('musicto_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.authenticated) {
          return parsed;
        }
      }
    } catch {}
    return { authenticated: false };
  });

  // Apply theme class to <html> / documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('musicto_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUnlock = (department: StationId | 'general') => {
    const newSession: InstructorSession = {
      authenticated: true,
      department,
      loggedInAt: new Date().toISOString(),
    };
    setSession(newSession);
    try {
      localStorage.setItem('musicto_session', JSON.stringify(newSession));
    } catch {}

    // If instructor unlocked for a specific department, route to their station
    if (department !== 'general') {
      setActiveStationId(department);
      setCurrentView('station');
    }
  };

  const handleLockApp = () => {
    setSession({ authenticated: false });
    try {
      localStorage.removeItem('musicto_session');
    } catch {}
  };

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [scannerTargetMember, setScannerTargetMember] = useState<Member | null>(null);

  // Live notification banner when remarks are saved across stations
  const [liveNotification, setLiveNotification] = useState<{
    message: string;
    stationId: StationId;
  } | null>(null);

  // Cross-tab and storage synchronization
  useEffect(() => {
    const unsubscribe = subscribeToMemberUpdates((updatedMembers) => {
      setMembers(updatedMembers);
    });
    return () => unsubscribe();
  }, []);

  // Save changes to storage whenever members array updates
  const updateMembersState = (newMembers: Member[]) => {
    setMembers(newMembers);
    saveStoredMembers(newMembers);
  };

  // Add new candidate from form
  const handleAddMember = (newMember: Member) => {
    const updated = [newMember, ...members];
    updateMembersState(updated);
  };

  // When candidate or evaluator scans a station QR
  const handleStationScanned = (stationId: StationId, memberId?: string) => {
    setActiveStationId(stationId);

    const targetId = memberId || selectedMemberId || members[0]?.id;
    if (targetId) {
      const targetMember = members.find((m) => m.id === targetId);
      if (targetMember) {
        const checkedInStations = targetMember.checkedInStations.includes(stationId)
          ? targetMember.checkedInStations
          : [...targetMember.checkedInStations, stationId];

        const updated = members.map((m) =>
          m.id === targetId
            ? {
                ...m,
                currentStation: stationId,
                checkedInStations,
              }
            : m
        );
        updateMembersState(updated);
        setSelectedMemberId(targetId);
        setCurrentView('evaluation');

        setLiveNotification({
          message: `${targetMember.name} checked in at ${
            STATIONS.find((s) => s.id === stationId)?.name
          } station!`,
          stationId,
        });
        setTimeout(() => setLiveNotification(null), 4000);
      }
    } else {
      setCurrentView('station');
    }
  };

  // Save evaluation (with traffic light coding, stars, notes, scouted flag)
  const handleSaveEvaluation = (
    memberId: string,
    stationId: StationId,
    evaluation: StationEvaluation
  ) => {
    const person = members.find((m) => m.id === memberId);
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          evaluations: {
            ...m.evaluations,
            [stationId]: evaluation,
          },
        };
      }
      return m;
    });

    updateMembersState(updated);

    const stationName = STATIONS.find((s) => s.id === stationId)?.name || stationId;
    setLiveNotification({
      message: `Remarks updated for ${person?.name || 'person'} at ${stationName}!`,
      stationId,
    });
    setTimeout(() => setLiveNotification(null), 4500);
  };

  const handleOpenScannerForMember = (member?: Member) => {
    setScannerTargetMember(member || null);
    setIsScannerOpen(true);
  };

  const handleSelectMemberForEvaluation = (member: Member, stationId?: StationId) => {
    setSelectedMemberId(member.id);
    if (stationId) {
      setActiveStationId(stationId);
    }
    setCurrentView('evaluation');
  };

  const handleResetData = () => {
    if (window.confirm('Reset back to sample demonstration data?')) {
      updateMembersState(INITIAL_MEMBERS);
      setSelectedMemberId(INITIAL_MEMBERS[0].id);
    }
  };

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  // If instructor has not authenticated, present the password lock screen
  if (!session.authenticated) {
    return (
      <InstructorLockScreen
        onUnlock={handleUnlock}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050507] text-slate-900 dark:text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors duration-200">
      {/* Global Navigation Bar */}
      <HeaderNavigation
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenScanner={() => handleOpenScannerForMember()}
        activeStationId={activeStationId}
        onResetData={handleResetData}
        theme={theme}
        onToggleTheme={toggleTheme}
        instructorDept={session.department}
        onLockApp={handleLockApp}
      />

      {/* Live Remarks Broadcast Notification Toast */}
      {liveNotification && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div className="bg-white dark:bg-[#0F0F16] border border-indigo-500/50 shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.35)] rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 dark:text-green-400 shrink-0">
              <Radio className="w-4 h-4 animate-pulse shadow-[0_0_5px_#22c55e]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {liveNotification.message}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                Live sync broadcast to all audition stations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'members' && (
          <AllMembersView
            members={members}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenScanner={handleOpenScannerForMember}
            onSelectMemberForEvaluation={handleSelectMemberForEvaluation}
            onExportCSV={() => exportMembersToCSV(members)}
          />
        )}

        {currentView === 'station' && (
          <StationModeView
            currentStationId={activeStationId}
            onSelectStation={setActiveStationId}
            members={members}
            onEvaluateCandidate={(m) => {
              setSelectedMemberId(m.id);
              setCurrentView('evaluation');
            }}
            onOpenStationQR={(sid) => {
              setActiveStationId(sid);
              setCurrentView('qrcards');
            }}
            onOpenScanner={() => handleOpenScannerForMember()}
          />
        )}

        {currentView === 'qrcards' && (
          <div className="py-4">
            <div className="max-w-md mx-auto px-4 mb-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentView('members')}
                className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                ← Back to Overview
              </button>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Station Signs
              </span>
            </div>
            <StationQRCard initialStationId={activeStationId} />
          </div>
        )}

        {currentView === 'evaluation' && selectedMember && (
          <EvaluationScreen
            member={selectedMember}
            activeStationId={activeStationId}
            onBack={() => setCurrentView('members')}
            onSaveEvaluation={handleSaveEvaluation}
            onChangeStation={setActiveStationId}
          />
        )}
      </main>

      {/* QR Scanner Modal (Matching Image 2) */}
      <StationQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        members={members}
        activeMember={scannerTargetMember}
        onStationScanned={handleStationScanned}
      />

      {/* Candidate Registration Form Modal */}
      <CandidateRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAddMember={handleAddMember}
        onStartStationScan={(newMem) => {
          handleOpenScannerForMember(newMem);
        }}
      />
    </div>
  );
}
