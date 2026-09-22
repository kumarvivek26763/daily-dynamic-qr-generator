import React, { useState, useEffect } from 'react';
import { QRConfig } from '../types';
import { generateQRDataUrl, generateQRSVG } from '../utils/qrUtils';
import { buildDynamicString, getTimeUntilMidnight, formatDate } from '../utils/dateUtils';
import { downloadDataUrl, downloadTextFile } from '../utils/exportUtils';
import { Download, Copy, Check, Clock, Calendar, RefreshCw, FileCode, ShieldCheck } from 'lucide-react';

interface SingleQRPreviewProps {
  config: QRConfig;
  currentDate: Date;
}

export const SingleQRPreview: React.FC<SingleQRPreviewProps> = ({ config, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Countdown timer to midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selectedDate if user hasn't modified it and real-time day changes
  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  // Dynamic text string
  const dynamicString = buildDynamicString(
    selectedDate,
    config.prefix,
    config.suffix,
    config.separator,
    config.dateFormat,
    config.customTemplate,
    config.useCustomTemplate
  );

  const formattedDateStr = formatDate(selectedDate, config.dateFormat);
  const fileName = `${config.prefix || '602062'}_${formattedDateStr}_${config.suffix || 'student'}.png`;

  // Render QR
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const render = async () => {
      try {
        const url = await generateQRDataUrl(dynamicString, {
          ...config,
          labelText: dynamicString,
        });
        const svg = await generateQRSVG(dynamicString, config);
        if (isMounted) {
          setQrDataUrl(url);
          setQrSvg(svg);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering QR code:', err);
        if (isMounted) setLoading(false);
      }
    };

    render();
    return () => {
      isMounted = false;
    };
  }, [dynamicString, config]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(dynamicString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    downloadDataUrl(qrDataUrl, fileName);
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    downloadTextFile(qrSvg, `qr_${config.prefix || 'code'}_${formattedDateStr}.svg`, 'image/svg+xml');
  };

  const isToday =
    selectedDate.getFullYear() === currentDate.getFullYear() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getDate() === currentDate.getDate();

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left: QR Code Display Frame */}
        <div className="flex flex-col items-center">
          <div className="relative p-5 bg-stone-50 border border-stone-200 rounded-2xl shadow-xs group">
            {loading ? (
              <div className="w-[280px] h-[280px] flex items-center justify-center text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${dynamicString}`}
                className="max-w-[280px] sm:max-w-[320px] h-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="w-[280px] h-[280px] flex items-center justify-center text-stone-400">
                Failed to render QR
              </div>
            )}

            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Scannable Text Encoded
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono">File: {fileName}</span>
          </div>
        </div>

        {/* Right: Dynamic Info, Next Day Auto-Update Status, & Actions */}
        <div className="flex-1 w-full space-y-5">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                {isToday ? "Today's Active QR" : 'Date Preview Mode'}
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-1">
                Dynamic Encoded String
              </h3>
            </div>

            {/* Date Tester controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  isToday
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tmr = new Date();
                  tmr.setDate(tmr.getDate() + 1);
                  setSelectedDate(tmr);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  !isToday
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Test Tomorrow (+1d)
              </button>
            </div>
          </div>

          {/* Current Encoded String Display */}
          <div className="bg-stone-900 text-white rounded-xl p-4 font-mono shadow-xs relative">
            <div className="text-[11px] text-stone-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Dynamic Scanned Payload</span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-stone-300 hover:text-white flex items-center gap-1 text-xs"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-300 break-all select-all">
              {dynamicString}
            </div>
            <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-2">
              <span>Date token:</span>
              <span className="text-white bg-stone-800 px-1.5 py-0.5 rounded font-medium">
                {formattedDateStr}
              </span>
            </div>
          </div>

          {/* Automatic Rollover Notice */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-900 block">
                Automatic Daily Midnight Rollover
              </span>
              <p className="text-amber-800 mt-0.5">
                Every day at midnight (00:00:00), the date portion automatically increments to the new day's date string.
              </p>
              <div className="mt-2 flex items-center gap-2 font-mono font-bold text-amber-950 text-xs">
                <span>Next roll in:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">
                  {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m :{' '}
                  {String(countdown.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Single Download Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="download-png-button"
              onClick={handleDownloadPNG}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 shadow-xs transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download PNG Image
            </button>

            <button
              type="button"
              id="download-svg-button"
              onClick={handleDownloadSVG}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 shadow-xs transition-all"
            >
              <FileCode className="w-4 h-4 text-stone-500" />
              Download Vector SVG
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
