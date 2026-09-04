import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Calendar,
  FileVideo,
  ExternalLink,
} from 'lucide-react';
import { PersonVideo, STATIONS, StationId } from '../types';
import { StationIcon } from './StationIcons';
import { getEmbedUrl, resolveVideoPlaybackUrl } from '../utils/videoHelpers';

interface PersonVideoModalProps {
  video: PersonVideo | null;
  memberName: string;
  onClose: () => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const PersonVideoModal: React.FC<PersonVideoModalProps> = ({
  video,
  memberName,
  onClose,
  onDeleteVideo,
}) => {
  const [playbackUrl, setPlaybackUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!video) return;
    setIsLoading(true);
    setError(null);

    let isMounted = true;
    resolveVideoPlaybackUrl(video)
      .then((url) => {
        if (isMounted) {
          setPlaybackUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Could not load video source.');
          setIsLoading(false);
          console.error(err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [video]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const station = STATIONS.find((s) => s.id === video.stationId);
  const embed = getEmbedUrl(playbackUrl || video.url);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove this tryout video?')) {
      onDeleteVideo?.(video.id);
      onClose();
    }
  };

  return (
    <div
      id="video-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161622]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <StationIcon stationId={video.stationId as StationId} size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {video.title || `${station?.name || video.stationId} Tryout`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                  {station?.name || video.stationId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono truncate">
                Candidate: <span className="text-indigo-600 dark:text-indigo-300 font-medium">{memberName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onDeleteVideo && (
              <button
                type="button"
                onClick={handleDelete}
                title="Delete video"
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Canvas */}
        <div className="relative w-full bg-black flex items-center justify-center min-h-[260px] sm:min-h-[400px] max-h-[60vh] overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400 font-mono text-xs">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading video...</span>
            </div>
          ) : error ? (
            <div className="text-center p-6 text-red-400 font-mono text-xs">
              <p>{error}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-indigo-400 underline hover:text-indigo-300"
              >
                Open external link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : embed.isEmbed && embed.embedUrl ? (
            <iframe
              src={embed.embedUrl}
              title={video.title || 'Tryout Video'}
              className="w-full h-[320px] sm:h-[440px] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={playbackUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full max-h-[60vh] object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          )}
        </div>

        {/* Footer info & notes */}
        <div className="p-4 sm:px-6 sm:py-4 bg-slate-50 dark:bg-[#161622] border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            {video.notes && (
              <p className="text-slate-700 dark:text-gray-300 text-xs italic bg-white dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                "{video.notes}"
              </p>
            )}
            <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400 font-mono text-[11px] pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                {new Date(video.createdAt).toLocaleDateString()} at{' '}
                {new Date(video.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-1">
                <FileVideo className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                <span className="capitalize">{video.type || 'video'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {video.url.startsWith('http') && (
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
