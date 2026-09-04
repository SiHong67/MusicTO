import React, { useState, useRef } from 'react';
import {
  Video,
  Play,
  Upload,
  Link as LinkIcon,
  Trash2,
  Plus,
  Camera,
  StopCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Member, PersonVideo, STATIONS, StationId } from '../types';
import { StationIcon } from './StationIcons';
import { saveVideoBlob } from '../utils/videoStore';

interface InstrumentVideoSectionProps {
  member: Member;
  currentStationId?: StationId;
  onAddVideo: (memberId: string, video: Omit<PersonVideo, 'id' | 'createdAt'>) => void;
  onDeleteVideo: (memberId: string, videoId: string) => void;
  onSelectVideo: (video: PersonVideo) => void;
  compact?: boolean;
}

export const InstrumentVideoSection: React.FC<InstrumentVideoSectionProps> = ({
  member,
  currentStationId,
  onAddVideo,
  onDeleteVideo,
  onSelectVideo,
  compact = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationId>(
    currentStationId || member.primaryStation || 'drums'
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'record'>('upload');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [filterStation, setFilterStation] = useState<StationId | 'all'>(
    currentStationId || 'all'
  );

  // Camera Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allVideos = member.videos || [];
  const filteredVideos =
    filterStation === 'all'
      ? allVideos
      : allVideos.filter((v) => v.stationId === filterStation);

  // Sample videos library for quick testing
  const sampleVideos = [
    {
      title: 'Groove & Pocket Tryout',
      stationId: 'drums' as StationId,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
    {
      title: 'Voicing & Pad Swells',
      stationId: 'keyboard' as StationId,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      title: 'Lead Riff & Tone Test',
      stationId: 'guitars' as StationId,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingFile(true);
    try {
      const vidId = `vid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      await saveVideoBlob(vidId, file);

      const stationConfig = STATIONS.find((s) => s.id === selectedStation);
      const generatedTitle =
        title.trim() || `${stationConfig?.name || selectedStation} - ${file.name}`;

      onAddVideo(member.id, {
        stationId: selectedStation,
        title: generatedTitle,
        url: `idb:${vidId}`,
        type: 'upload',
        notes: notes.trim(),
      });

      // Reset form
      setTitle('');
      setNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to process video file', err);
      alert('Failed to upload video file. Please try again.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const stationConfig = STATIONS.find((s) => s.id === selectedStation);
    const generatedTitle =
      title.trim() || `${stationConfig?.name || selectedStation} Video Tryout`;

    onAddVideo(member.id, {
      stationId: selectedStation,
      title: generatedTitle,
      url: linkUrl.trim(),
      type: 'link',
      notes: notes.trim(),
    });

    // Reset form
    setTitle('');
    setNotes('');
    setLinkUrl('');
    setIsAdding(false);
  };

  const handleAddSample = (sample: typeof sampleVideos[0]) => {
    onAddVideo(member.id, {
      stationId: sample.stationId,
      title: `${sample.title} (${member.name})`,
      url: sample.url,
      type: 'sample',
      notes: 'Sample audition recording for candidate evaluation review.',
    });
    setIsAdding(false);
  };

  // Camera Recording Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error', err);
      alert('Camera or microphone access denied or not available.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const startRecording = () => {
    if (!cameraStream) return;
    videoChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(cameraStream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        videoChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(videoChunksRef.current, { type: mimeType });
      const vidId = `vid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      await saveVideoBlob(vidId, blob);

      const stationConfig = STATIONS.find((s) => s.id === selectedStation);
      onAddVideo(member.id, {
        stationId: selectedStation,
        title: title.trim() || `${stationConfig?.name || selectedStation} Live Recording`,
        url: `idb:${vidId}`,
        type: 'recording',
        notes: notes.trim(),
      });

      stopCamera();
      setIsAdding(false);
      setTitle('');
      setNotes('');
    };

    recorder.start(1000);
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Video className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-gray-200 uppercase tracking-wider">
            Instrument Tryout Videos
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-indigo-300 font-mono text-[11px] font-bold">
            {allVideos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Station filter chips if viewing all videos */}
          {!compact && allVideos.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setFilterStation('all')}
                className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  filterStation === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All ({allVideos.length})
              </button>
              {STATIONS.map((st) => {
                const count = allVideos.filter((v) => v.stationId === st.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFilterStation(st.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors ${
                      filterStation === st.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <StationIcon stationId={st.id} size={10} />
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (isAdding) {
                stopCamera();
              }
              setIsAdding(!isAdding);
            }}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isAdding
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
            }`}
          >
            {isAdding ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Video Drawer / Box */}
      {isAdding && (
        <div className="p-4 bg-[#12121A] border border-indigo-500/30 rounded-xl space-y-4 animate-fadeIn">
          {/* Instrument Selector */}
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest mb-1.5">
              Select Instrument Tried
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {STATIONS.map((st) => {
                const isSel = selectedStation === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStation(st.id)}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      isSel
                        ? 'bg-indigo-950/90 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'bg-[#181824] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <StationIcon stationId={st.id} size={16} />
                    <span className="text-[10px] font-mono uppercase">{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Title & Notes Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest mb-1">
                Video Title / Tryout Label
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. ${STATIONS.find((s) => s.id === selectedStation)?.name} Tryout Test`}
                className="w-full bg-[#181824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest mb-1">
                Remarks / Key Moment (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Great pocket in chorus, watch timing at 0:15"
                className="w-full bg-[#181824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mode Tabs: Upload, Link, Record, or Quick Sample */}
          <div className="flex border-b border-white/10 gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`pb-2 px-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-300 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('link');
              }}
              className={`pb-2 px-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'link'
                  ? 'border-indigo-500 text-indigo-300 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Video Link / Drive / YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('record');
                startCamera();
              }}
              className={`pb-2 px-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'record'
                  ? 'border-indigo-500 text-indigo-300 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Record Camera</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.mov,.webm,.m4v"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-white/15 bg-[#181824] text-gray-400 hover:border-indigo-500/50 hover:bg-white/5'
                }`}
              >
                {isProcessingFile ? (
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Saving video to tryouts vault...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-indigo-400" />
                    <p className="text-xs font-medium text-gray-200">
                      Drag & drop tryout video file here, or{' '}
                      <span className="text-indigo-400 underline">browse files</span>
                    </p>
                    <p className="text-[10px] font-mono text-gray-500">
                      Supports MP4, MOV, WEBM, M4V (Saved locally in app storage)
                    </p>
                  </>
                )}
              </div>

              {/* Sample clip quick button */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                <span>Want to test quickly without recording?</span>
                <div className="flex items-center gap-1.5">
                  {sampleVideos.map((sample) => (
                    <button
                      key={sample.stationId}
                      type="button"
                      onClick={() => handleAddSample(sample)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-indigo-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>+ {sample.stationId} Demo</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Video Link / Drive / YouTube */}
          {activeTab === 'link' && (
            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest mb-1">
                  Video URL / Embed Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/... or https://youtu.be/... or .mp4 URL"
                    className="flex-1 bg-[#181824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    Save Video
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  Supports Google Drive preview links, YouTube videos, Vimeo, and direct video URLs.
                </p>
              </div>
            </form>
          )}

          {/* Tab 3: Camera Live Recorder */}
          {activeTab === 'record' && (
            <div className="space-y-3">
              <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video max-h-[260px] flex items-center justify-center border border-white/10">
                <video
                  ref={cameraVideoRef}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {isRecording && (
                  <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>REC {recordingSeconds}s</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 border border-white/20 transition-all"
                  >
                    <StopCircle className="w-4 h-4 text-red-400" />
                    <span>Stop & Save Video</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-white font-mono"
                >
                  Close Camera
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Gallery Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-4 bg-[#12121A] border border-white/5 rounded-xl text-center">
          <p className="text-xs text-gray-400 font-mono">
            {filterStation === 'all'
              ? 'No instrument tryout videos recorded for this person yet.'
              : `No videos for ${STATIONS.find((s) => s.id === filterStation)?.name || filterStation} yet.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedStation(
                filterStation !== 'all' ? filterStation : currentStationId || 'drums'
              );
              setIsAdding(true);
            }}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium underline"
          >
            + Attach or record tryout video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredVideos.map((vid) => {
            const station = STATIONS.find((s) => s.id === vid.stationId);
            return (
              <div
                key={vid.id}
                className="group relative bg-[#12121A] border border-white/10 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Video Card Thumbnail / Play trigger */}
                <div
                  onClick={() => onSelectVideo(vid)}
                  className="relative aspect-video bg-black/60 cursor-pointer overflow-hidden flex items-center justify-center group-hover:bg-black/40 transition-colors"
                >
                  {/* Decorative instrument placeholder background */}
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center bg-gradient-to-br from-indigo-950/60 to-black">
                    <StationIcon stationId={vid.stationId} size={48} />
                  </div>

                  {/* Play Button Overlay */}
                  <div className="relative w-10 h-10 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>

                  {/* Instrument Badge Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-white text-[10px] font-mono uppercase">
                    <StationIcon stationId={vid.stationId} size={12} />
                    <span>{station?.name || vid.stationId}</span>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-gray-300 uppercase">
                    {vid.type || 'video'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-1">
                  <div>
                    <h4
                      onClick={() => onSelectVideo(vid)}
                      className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer line-clamp-1"
                    >
                      {vid.title || `${station?.name || vid.stationId} Tryout`}
                    </h4>
                    {vid.notes && (
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 italic">
                        "{vid.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-2 border-t border-white/5">
                    <span>{new Date(vid.createdAt).toLocaleDateString()}</span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this tryout video?')) {
                          onDeleteVideo(member.id, vid.id);
                        }
                      }}
                      title="Delete video"
                      className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
