import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { X, Search, Scan, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { STATIONS, StationId, Member } from '../types';
import { StationIcon } from './StationIcons';

interface StationQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onStationScanned: (stationId: StationId, memberId?: string) => void;
  activeMember?: Member | null;
}

export const StationQRScannerModal: React.FC<StationQRScannerModalProps> = ({
  isOpen,
  onClose,
  members,
  onStationScanned,
  activeMember,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'search'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    activeMember?.id || (members[0]?.id ?? '')
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeMember) {
      setSelectedCandidateId(activeMember.id);
    }
  }, [activeMember]);

  // Start / stop camera when scan tab is active and modal is open
  useEffect(() => {
    if (!isOpen || activeTab !== 'scan') {
      stopCamera();
      return;
    }

    let isSubscribed = true;

    async function startCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported in this browser environment');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          scanFrame();
        }
      } catch (err: unknown) {
        console.warn('Camera access error:', err);
        const msg =
          err instanceof Error ? err.message : 'Camera unavailable or permission denied';
        setCameraError(msg);
      }
    }

    startCamera();

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleQRData(code.data);
          return; // Stop loop once detected
        }
      }
    }

    requestAnimationRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQRData = (dataStr: string) => {
    try {
      // Try JSON payload first
      let matchedStationId: StationId | null = null;
      if (dataStr.startsWith('{')) {
        const parsed = JSON.parse(dataStr);
        if (parsed.stationId && STATIONS.some((s) => s.id === parsed.stationId)) {
          matchedStationId = parsed.stationId;
        }
      } else {
        // Match string station names or codes
        const lower = dataStr.toLowerCase();
        for (const s of STATIONS) {
          if (lower.includes(s.id) || lower.includes(s.name.toLowerCase())) {
            matchedStationId = s.id;
            break;
          }
        }
      }

      if (matchedStationId) {
        triggerSuccess(matchedStationId);
      }
    } catch (err) {
      console.error('Error parsing QR data', err);
    }
  };

  const triggerSuccess = (stationId: StationId) => {
    const station = STATIONS.find((s) => s.id === stationId);
    setScannedSuccess(`Scanned ${station?.name || stationId} Station!`);
    setTimeout(() => {
      setScannedSuccess(null);
      onStationScanned(stationId, selectedCandidateId || undefined);
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  const currentSelectedMember = members.find((m) => m.id === selectedCandidateId);
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F0F16] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
                Station Scanner
              </h2>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                Scan Station QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-scanner"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-[#12121A] hover:bg-[#1A1A24] border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Person Selector */}
        <div className="mb-4 bg-[#12121A] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold">PERSON:</span>
            <span className="text-xs font-bold text-white truncate font-sans">
              {currentSelectedMember?.name || 'Select person'}
            </span>
            {currentSelectedMember && (
              <span className="bg-[#1A1A24] text-indigo-300 border border-white/10 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                {currentSelectedMember.cg}
              </span>
            )}
          </div>
          <select
            id="scanner-candidate-select"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="bg-[#1A1A24] text-indigo-300 border border-white/10 text-xs font-mono rounded-lg px-2.5 py-1.5 outline-none max-w-[140px] focus:border-indigo-500"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#12121A] text-white">
                {m.name} ({m.cg})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Toggle: Search vs Scan QR */}
        <div className="flex items-center bg-[#12121A] p-1 rounded-xl mb-5 border border-white/10">
          <button
            id="tab-search"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            id="tab-scan-qr"
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* SCAN QR TAB */}
        {activeTab === 'scan' && (
          <div className="flex flex-col items-center">
            {/* Camera Viewfinder Box */}
            <div className="relative w-64 h-64 bg-[#08080C] rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-44 h-44 rounded-xl border-2 border-indigo-500/70 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  {/* Cyber Corner Accents */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-indigo-400 rounded-tl-sm shadow-[0_0_8px_#818cf8]" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-indigo-400 rounded-tr-sm shadow-[0_0_8px_#818cf8]" />
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-indigo-400 rounded-bl-sm shadow-[0_0_8px_#818cf8]" />
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-indigo-400 rounded-br-sm shadow-[0_0_8px_#818cf8]" />

                  {/* Scanning active laser pulse line */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanner-laser shadow-[0_0_10px_#22d3ee]" />
                </div>
              </div>

              {/* Success Notification Banner */}
              {scannedSuccess && (
                <div className="absolute inset-0 bg-[#08080C]/95 backdrop-blur-md flex flex-col items-center justify-center gap-2.5 text-white p-4 animate-fadeIn border border-green-500/40">
                  <CheckCircle2 className="w-12 h-12 text-green-400 animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                  <p className="font-mono uppercase font-bold text-sm text-center text-green-300 tracking-wider">
                    {scannedSuccess}
                  </p>
                </div>
              )}

              {/* Camera unavailable fallback message */}
              {cameraError && (
                <div className="absolute inset-0 bg-[#08080C]/95 p-4 flex flex-col items-center justify-center text-center">
                  <Camera className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-300 font-mono uppercase tracking-wider font-semibold mb-1">
                    CAMERA VIEWFINDER READY
                  </p>
                  <p className="text-[10px] text-gray-500 font-sans">
                    Select a station below:
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-4 text-center font-mono uppercase tracking-wider text-[10px]">
              Scan Station QR or select below
            </p>

            {/* Quick Station Buttons */}
            <div className="w-full bg-[#12121A] p-3.5 rounded-xl border border-white/10">
              <span className="block text-[10px] font-bold text-gray-400 mb-2.5 uppercase font-mono tracking-widest text-center">
                SELECT STATION
              </span>
              <div className="grid grid-cols-3 gap-2">
                {STATIONS.map((station) => (
                  <button
                    key={station.id}
                    id={`simulate-scan-${station.id}`}
                    onClick={() => triggerSuccess(station.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-[#1A1A24] hover:bg-indigo-600/80 text-gray-200 hover:text-white text-xs font-mono uppercase font-semibold border border-white/10 hover:border-indigo-400/60 transition-all active:scale-95"
                  >
                    <StationIcon stationId={station.id} size={13} />
                    <span>{station.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                id="scanner-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or CG..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredMembers.map((member) => {
                const isSelected = member.id === selectedCandidateId;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedCandidateId(member.id)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]'
                        : 'bg-[#12121A] border-white/5 text-gray-300 hover:bg-[#1A1A24]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{member.name}</span>
                        <span className="bg-[#1A1A24] text-indigo-300 border border-white/10 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                          {member.cg}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">
                        Age: {member.age} • {member.followUpStatus === 'finished' ? 'Finished Follow Up' : 'Going Through Follow Up'}
                      </p>
                    </div>

                    <span className="text-xs font-mono uppercase font-bold text-indigo-400">
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Direct Station destination buttons */}
            <div className="pt-3 border-t border-white/10">
              <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-2.5">
                SELECT STATION:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => triggerSuccess(station.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#1A1A24] hover:bg-indigo-600 text-white text-xs font-mono uppercase font-semibold border border-white/10 transition-all"
                  >
                    <StationIcon stationId={station.id} size={13} />
                    <span>{station.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
