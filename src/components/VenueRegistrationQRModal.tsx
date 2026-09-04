import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  ExternalLink,
  Music,
  Download,
} from 'lucide-react';

interface VenueRegistrationQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestStudentView?: () => void;
}

export const VenueRegistrationQRModal: React.FC<VenueRegistrationQRModalProps> = ({
  isOpen,
  onClose,
  onTestStudentView,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}?mode=student`;
    setRegistrationUrl(url);

    QRCode.toDataURL(url, {
      width: 380,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error('Error generating registration QR', err));
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!registrationUrl) return;
    navigator.clipboard.writeText(registrationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'MusicTO_Venue_Registration_QR.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Venue Registration QR Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                Display at entrance for student self-registration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Poster Area */}
        <div className="overflow-y-auto py-4 flex-1">
          <div
            ref={posterRef}
            className="bg-gradient-to-b from-slate-50 to-indigo-50/40 dark:from-[#12121A] dark:to-[#0D0D14] border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-2xl p-6 text-center space-y-4 shadow-sm"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Music Tryouts Check-in</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Scan to Register
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                Point your phone camera here to enter your details and activate your Tryout Pass.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 inline-block mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Venue Registration QR"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-slate-400 text-xs font-mono">
                  Generating QR code...
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
              URL: <span className="font-semibold text-slate-700 dark:text-gray-300 break-all">{registrationUrl}</span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Save PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-500" />
              <span>Print Poster</span>
            </button>
          </div>

          {onTestStudentView && (
            <button
              onClick={() => {
                onClose();
                onTestStudentView();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Student View on This Device (Mark&apos;s Phone Experience)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
