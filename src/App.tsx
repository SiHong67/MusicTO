import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Member,
  StationId,
  StationEvaluation,
  STATIONS,
  ThemePreference,
  InstructorSession,
  StudentSession,
} from './types';
import {
  getStoredMembers,
  saveStoredMembers,
  subscribeToMemberUpdates,
  exportMembersToCSV,
  getStoredStudentSession,
  saveStoredStudentSession,
  clearStoredStudentSession,
  apiRegisterCandidate,
  apiCheckinStation,
  apiSaveEvaluation,
  apiResetData,
  fetchMembersFromServer,
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
import { StudentRegistrationView } from './components/StudentRegistrationView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { VenueRegistrationQRModal } from './components/VenueRegistrationQRModal';
import { Radio, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => getStoredMembers());
  const [currentView, setCurrentView] = useState<MainView>('members');
  const [activeStationId, setActiveStationId] = useState<StationId>('drums');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>('mem-1');

  // App Role Mode: 'instructor' | 'student'
  const [appMode, setAppMode] = useState<'instructor' | 'student'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const urlStation = params.get('station');
      if (urlMode === 'student' || urlMode === 'register' || Boolean(urlStation)) {
        return 'student';
      }
      if (urlMode === 'instructor') {
        return 'instructor';
      }
    }
    // If student session exists in storage and no active instructor session, default to student
    try {
      const studentSess = getStoredStudentSession();
      const instructorSess = localStorage.getItem('musicto_session');
      if (studentSess && (!instructorSess || !JSON.parse(instructorSess)?.authenticated)) {
        return 'student';
      }
    } catch {}
    return 'instructor';
  });

  // Pending station from QR code URL (e.g. ?station=keyboard)
  const [pendingStationId, setPendingStationId] = useState<StationId | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('station') as StationId;
      if (s && STATIONS.some((item) => item.id === s)) {
        return s;
      }
    }
    return undefined;
  });

  // Student Session
  const [studentSession, setStudentSession] = useState<StudentSession | null>(() =>
    getStoredStudentSession()
  );

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

  // Instructor Authentication Session
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

  // Apply theme class to documentElement
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

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVenueQROpen, setIsVenueQROpen] = useState(false);
  const [scannerTargetMember, setScannerTargetMember] = useState<Member | null>(null);

  // Live notification banner
  const [liveNotification, setLiveNotification] = useState<{
    message: string;
    stationId?: StationId;
  } | null>(null);

  const showNotification = useCallback((message: string, stationId?: StationId) => {
    setLiveNotification({ message, stationId });
    setTimeout(() => setLiveNotification(null), 4500);
  }, []);

  // Sync state helper
  const updateMembersState = useCallback((newMembers: Member[]) => {
    setMembers(newMembers);
    saveStoredMembers(newMembers);
  }, []);

  // Polling server for real-time updates across multiple phones/tabs
  useEffect(() => {
    let isMounted = true;

    // Initial server fetch
    fetchMembersFromServer().then((serverMembers) => {
      if (isMounted && serverMembers && serverMembers.length > 0) {
        updateMembersState(serverMembers);
      }
    });

    // Cross-tab broadcast listener
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      if (isMounted) {
        setMembers(updated);
      }
    });

    // Periodic poll every 3 seconds to ensure real-time multi-device sync
    const pollInterval = setInterval(() => {
      fetchMembersFromServer().then((serverMembers) => {
        if (isMounted && serverMembers && serverMembers.length > 0) {
          // Compare if length or timestamps differ
          setMembers((prev) => {
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(serverMembers);
            if (hasChanged) {
              saveStoredMembers(serverMembers);
              return serverMembers;
            }
            return prev;
          });
        }
      });
    }, 3000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [updateMembersState]);

  // Current logged in student member object
  const currentStudent = members.find((m) => m.id === studentSession?.memberId) || null;

  // If a student arrives via a station QR URL with an active session, auto check-in
  const hasAutoCheckedInRef = useRef<string | null>(null);
  useEffect(() => {
    if (pendingStationId && currentStudent && appMode === 'student') {
      const checkKey = `${currentStudent.id}-${pendingStationId}`;
      if (hasAutoCheckedInRef.current !== checkKey) {
        hasAutoCheckedInRef.current = checkKey;
        handleStudentStationCheckin(currentStudent.id, pendingStationId);
        showNotification(
          `Checked into ${STATIONS.find((s) => s.id === pendingStationId)?.name} station!`,
          pendingStationId
        );
      }
    }
  }, [pendingStationId, currentStudent, appMode, showNotification]);

  // Instructor Unlock
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

    setAppMode('instructor');
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

  // Student registration handler
  const handleStudentRegister = async (newMember: Member, directStationId?: StationId) => {
    // 1. Save to server & local storage
    await apiRegisterCandidate(newMember);
    const updated = [newMember, ...members.filter((m) => m.id !== newMember.id)];
    updateMembersState(updated);

    // 2. Establish student session
    const sess: StudentSession = {
      memberId: newMember.id,
      name: newMember.name,
      registeredAt: new Date().toISOString(),
    };
    saveStoredStudentSession(sess);
    setStudentSession(sess);

    // 3. Check into station if requested or pending
    const targetStation = directStationId || pendingStationId;
    if (targetStation) {
      await handleStudentStationCheckin(newMember.id, targetStation);
    }

    setAppMode('student');
    showNotification(`Welcome, ${newMember.name}! You are registered for music tryouts.`);
  };

  // Student station check-in handler
  const handleStudentStationCheckin = async (studentMemberId: string, stationId: StationId) => {
    await apiCheckinStation(studentMemberId, stationId);

    const updated = members.map((m) => {
      if (m.id === studentMemberId) {
        const checkedInStations = m.checkedInStations.includes(stationId)
          ? m.checkedInStations
          : [...m.checkedInStations, stationId];
        return {
          ...m,
          currentStation: stationId,
          checkedInStations,
        };
      }
      return m;
    });

    updateMembersState(updated);
    setActiveStationId(stationId);

    const sName = STATIONS.find((s) => s.id === stationId)?.name || stationId;
    showNotification(`Successfully checked in to ${sName} station!`, stationId);
  };

  const handleStudentLogout = () => {
    clearStoredStudentSession();
    setStudentSession(null);
  };

  // Instructor Add Member
  const handleAddMember = async (newMember: Member) => {
    await apiRegisterCandidate(newMember);
    const updated = [newMember, ...members];
    updateMembersState(updated);
  };

  // Station Scanned via Camera or QR
  const handleStationScanned = async (stationId: StationId, memberId?: string) => {
    setActiveStationId(stationId);

    const targetId = memberId || selectedMemberId || currentStudent?.id || members[0]?.id;
    if (targetId) {
      await handleStudentStationCheckin(targetId, stationId);
      setSelectedMemberId(targetId);

      if (appMode === 'instructor') {
        setCurrentView('evaluation');
      }
    } else {
      if (appMode === 'instructor') {
        setCurrentView('station');
      }
    }
  };

  // Instructor saves evaluation
  const handleSaveEvaluation = async (
    memberId: string,
    stationId: StationId,
    evaluation: StationEvaluation
  ) => {
    await apiSaveEvaluation(memberId, stationId, evaluation);

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
    showNotification(`Remarks saved for ${person?.name || 'candidate'} at ${stationName}!`, stationId);
  };

  const handleOpenScannerForMember = (member?: Member) => {
    setScannerTargetMember(member || currentStudent || null);
    setIsScannerOpen(true);
  };

  const handleSelectMemberForEvaluation = (member: Member, stationId?: StationId) => {
    setSelectedMemberId(member.id);
    if (stationId) {
      setActiveStationId(stationId);
    }
    setCurrentView('evaluation');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset back to sample demonstration data?')) {
      await apiResetData(INITIAL_MEMBERS);
      updateMembersState(INITIAL_MEMBERS);
      setSelectedMemberId(INITIAL_MEMBERS[0].id);
      showNotification('Audition database reset to default demo data.');
    }
  };

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  // ==========================================
  // RENDER: STUDENT VIEW (Mark's Phone Experience)
  // ==========================================
  if (appMode === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050507] text-slate-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
        {/* Toast Notification */}
        {liveNotification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
            <div className="bg-white dark:bg-[#0F0F16] border border-indigo-500/50 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {liveNotification.message}
              </p>
            </div>
          </div>
        )}

        {currentStudent ? (
          <StudentDashboardView
            member={currentStudent}
            onCheckinStation={(sid) => handleStudentStationCheckin(currentStudent.id, sid)}
            onOpenScanner={() => handleOpenScannerForMember(currentStudent)}
            onLogout={handleStudentLogout}
            onEditRegistration={() => {
              clearStoredStudentSession();
              setStudentSession(null);
            }}
            onSwitchToInstructor={() => setAppMode('instructor')}
          />
        ) : (
          <StudentRegistrationView
            onRegister={handleStudentRegister}
            pendingStationId={pendingStationId}
            onSwitchToInstructor={() => setAppMode('instructor')}
            existingMembers={members}
            onSelectExisting={(mem) => {
              const sess: StudentSession = {
                memberId: mem.id,
                name: mem.name,
                registeredAt: new Date().toISOString(),
              };
              saveStoredStudentSession(sess);
              setStudentSession(sess);
              if (pendingStationId) {
                handleStudentStationCheckin(mem.id, pendingStationId);
              }
            }}
          />
        )}

        {/* QR Scanner Modal for student scanning station signs */}
        <StationQRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          members={members}
          activeMember={currentStudent}
          onStationScanned={(sid) => {
            if (currentStudent) {
              handleStudentStationCheckin(currentStudent.id, sid);
            }
            setIsScannerOpen(false);
          }}
        />
      </div>
    );
  }

  // ==========================================
  // RENDER: INSTRUCTOR PASSWORD LOCK SCREEN
  // ==========================================
  if (!session.authenticated) {
    return (
      <InstructorLockScreen
        onUnlock={handleUnlock}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSwitchToStudent={() => setAppMode('student')}
      />
    );
  }

  // ==========================================
  // RENDER: INSTRUCTOR / EVALUATOR PORTAL
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050507] text-slate-900 dark:text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors duration-200">
      {/* Global Navigation Bar */}
      <HeaderNavigation
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenScanner={() => handleOpenScannerForMember()}
        onOpenVenueQR={() => setIsVenueQROpen(true)}
        onSwitchToStudentView={() => setAppMode('student')}
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
                Live sync broadcast across all stations
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
            onOpenVenueQR={() => setIsVenueQROpen(true)}
          />
        )}

        {currentView === 'qrcards' && (
          <div className="py-4">
            <div className="max-w-md mx-auto px-4 mb-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentView('members')}
                className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Overview
              </button>
              <button
                onClick={() => setIsVenueQROpen(true)}
                className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Show Venue Entry QR
              </button>
            </div>
            <StationQRCard
              initialStationId={activeStationId}
              onOpenVenueQR={() => setIsVenueQROpen(true)}
            />
          </div>
        )}

        {currentView === 'evaluation' && selectedMember && (
          <EvaluationScreen
            member={selectedMember}
            activeStationId={activeStationId}
            onBack={() => setCurrentView('station')}
            onSaveEvaluation={handleSaveEvaluation}
            onChangeStation={setActiveStationId}
          />
        )}
      </main>

      {/* Station QR Scanner Modal */}
      <StationQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        members={members}
        activeMember={scannerTargetMember}
        onStationScanned={handleStationScanned}
      />

      {/* Candidate Registration Form Modal (Instructor initiated) */}
      <CandidateRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAddMember={handleAddMember}
        onStartStationScan={(newMem) => {
          handleOpenScannerForMember(newMem);
        }}
      />

      {/* Venue Entrance QR Code Poster Modal */}
      <VenueRegistrationQRModal
        isOpen={isVenueQROpen}
        onClose={() => setIsVenueQROpen(false)}
        onTestStudentView={() => {
          setIsVenueQROpen(false);
          setAppMode('student');
        }}
      />
    </div>
  );
}
