import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Volume2, Check, Printer } from 'lucide-react';
import { STATIONS } from '../types';
import { StationIcon } from './StationIcons';

interface StationQRCardProps {
  initialStationId?: string;
}

export const StationQRCard: React.FC<StationQRCardProps> = ({ initialStationId = 'drums' }) => {
  const [selectedStationId, setSelectedStationId] = useState(initialStationId);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStation = STATIONS.find((s) => s.id === selectedStationId) || STATIONS[0];

  useEffect(() => {
    // Generate QR payload containing station info and action
    const qrPayload = JSON.stringify({
      app: 'MusicTO',
      type: 'STATION_CHECKIN',
      stationId: currentStation.id,
      stationName: currentStation.name,
      code: currentStation.code,
      url: `${window.location.origin}?station=${currentStation.id}`,
    });

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code', err);
      });
  }, [currentStation]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `MusicTO_${currentStation.name}_QR.png`;
    link.click();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto animate-fadeIn">
      {/* Station Selector Pills */}
      <div className="w-full mb-6">
        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-2.5 text-center">
          SELECT STATION QR CODE
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STATIONS.map((st) => {
            const isSelected = st.id === selectedStationId;
            return (
              <button
                key={st.id}
                id={`select-station-${st.id}`}
                onClick={() => setSelectedStationId(st.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono uppercase transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.4)] font-bold'
                    : 'bg-[#0F0F16] hover:bg-[#12121A] text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                <StationIcon stationId={st.id} size={13} />
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        id="station-qr-card"
        className="w-full bg-[#0F0F16] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative"
      >
        {/* Top Logo Bar */}
        <div className="flex items-center gap-2 mb-6 bg-[#12121A] px-4 py-1.5 rounded-full border border-white/10">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-200">
            MusicTO
          </span>
        </div>

        {/* QR Code Container */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-2xl p-4 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)] mb-6 transition-transform">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${currentStation.name} Station QR Code`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="animate-pulse w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-gray-500 font-mono text-xs">
              Generating QR...
            </div>
          )}
        </div>

        {/* Station Name */}
        <div className="flex items-center justify-center mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            {currentStation.name}
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-5 space-y-3">
        <button
          id="btn-save-qr-code"
          onClick={handleDownloadQR}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] uppercase text-xs font-mono tracking-widest transition-all"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-green-300" />
              <span>QR Code Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Station QR Code</span>
            </>
          )}
        </button>

        <button
          id="btn-print-qr-code"
          onClick={handlePrint}
          className="w-full bg-[#12121A] hover:bg-[#1A1A24] text-gray-300 font-mono uppercase font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs border border-white/10 transition-all"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Print Station Signboard</span>
        </button>

        <p className="text-[10px] text-gray-500 text-center font-mono uppercase tracking-wider">
          Scan this station sign to check in
        </p>
      </div>
    </div>
  );
};
