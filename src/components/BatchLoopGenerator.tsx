import React, { useState, useEffect } from 'react';
import { QRConfig, GeneratedDayQR } from '../types';
import { getDaysLoop, buildDynamicString, formatDate, getCurrentLocalDate } from '../utils/dateUtils';
import { generateQRDataUrl } from '../utils/qrUtils';
import { exportToZip, exportToLocalDirectoryPicker, downloadDataUrl } from '../utils/exportUtils';
import { FolderDown, Archive, Play, CheckCircle2, Download, AlertCircle, CalendarRange, Sparkles } from 'lucide-react';

interface BatchLoopGeneratorProps {
  config: QRConfig;
  currentDate: Date;
}

export const BatchLoopGenerator: React.FC<BatchLoopGeneratorProps> = ({ config, currentDate }) => {
  const [daysCount, setDaysCount] = useState<number>(7);
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    return getCurrentLocalDate(currentDate);
  });
  const [generatedList, setGeneratedList] = useState<GeneratedDayQR[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Automatically generate on first load or when user clicks Generate
  const runDateLoopGeneration = async (daysToGenerate: number, start: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setExportStatus({ type: 'idle', message: '' });

    const startDate = new Date(start + 'T00:00:00');
    const dateArray = getDaysLoop(startDate, daysToGenerate);
    const results: GeneratedDayQR[] = [];

    for (let i = 0; i < dateArray.length; i++) {
      const d = dateArray[i];
      const dateFormatted = formatDate(d, config.dateFormat);
      const str = buildDynamicString(
        d,
        config.prefix,
        config.suffix,
        config.separator,
        config.dateFormat,
        config.customTemplate,
        config.useCustomTemplate
      );

      const fileName = `${config.prefix || '602062'}_${dateFormatted}_${config.suffix || 'student'}.png`;

      // Generate PNG dataUrl
      const dataUrl = await generateQRDataUrl(str, {
        ...config,
        labelText: str,
      });

      results.push({
        date: d,
        dateStr: dateFormatted,
        formattedString: str,
        dataUrl,
        fileName,
      });

      setGenerationProgress(Math.round(((i + 1) / dateArray.length) * 100));
    }

    setGeneratedList(results);
    setIsGenerating(false);
  };

  useEffect(() => {
    runDateLoopGeneration(daysCount, startDateStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.prefix, config.suffix, config.separator, config.dateFormat, config.size, config.includeLabel]);

  const handleExportZip = async () => {
    if (generatedList.length === 0) return;
    try {
      await exportToZip(generatedList, `qr_${config.prefix || 'batch'}_${daysCount}days.zip`);
      setExportStatus({
        type: 'success',
        message: `Successfully downloaded ZIP with ${generatedList.length} daily QR code images!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExportStatus({
        type: 'error',
        message: `Failed to export ZIP: ${msg}`,
      });
    }
  };

  const handleExportDirectoryPicker = async () => {
    if (generatedList.length === 0) return;
    try {
      const result = await exportToLocalDirectoryPicker(generatedList);
      if (result.success) {
        setExportStatus({
          type: 'success',
          message: result.message,
        });
      } else {
        setExportStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExportStatus({
        type: 'error',
        message: `Failed to access folder: ${msg}`,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Batch Date Loop Generator
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Loop through consecutive dates, generate high-resolution QR codes, and export into a local folder
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="export-zip-button"
            onClick={handleExportZip}
            disabled={isGenerating || generatedList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xs"
          >
            <Archive className="w-4 h-4 text-amber-400" />
            Export Folder as ZIP ({generatedList.length} files)
          </button>

          <button
            type="button"
            id="export-local-folder-button"
            onClick={handleExportDirectoryPicker}
            disabled={isGenerating || generatedList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 transition-all"
            title="Pick a directory on your local computer to save all PNG files directly"
          >
            <FolderDown className="w-4 h-4 text-amber-700" />
            Save to Local Folder
          </button>
        </div>
      </div>

      {/* Loop Settings Form */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label htmlFor="batch-start-date" className="block font-semibold text-stone-700 mb-1">
            Start Date (Loop Origin)
          </label>
          <input
            type="date"
            id="batch-start-date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div>
          <label htmlFor="batch-days-count" className="block font-semibold text-stone-700 mb-1">
            Loop Iterations (Days)
          </label>
          <div className="flex items-center gap-1.5">
            {[7, 14, 30, 60].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setDaysCount(count);
                  runDateLoopGeneration(count, startDateStr);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${
                  daysCount === count
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                {count}d
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => runDateLoopGeneration(daysCount, startDateStr)}
            disabled={isGenerating}
            className="w-full py-2 px-3 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {isGenerating ? `Generating (${generationProgress}%)...` : 'Re-run Date Loop'}
          </button>
        </div>
      </div>

      {/* Progress Bar (while generating) */}
      {isGenerating && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-600">
            <span>Generating QR images loop...</span>
            <span className="font-mono font-medium">{generationProgress}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-150"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Status Banner */}
      {exportStatus.type !== 'idle' && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            exportStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {exportStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span>{exportStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportStatus({ type: 'idle', message: '' })}
            className="text-stone-400 hover:text-stone-700 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Generated Grid View */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-stone-700">
            Loop Results ({generatedList.length} Consecutive Days)
          </span>
          <span className="text-stone-400 font-mono">
            Pattern: {config.prefix}/{config.dateFormat}/{config.suffix}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {generatedList.map((item, idx) => {
            const isTodayItem = idx === 0;
            return (
              <div
                key={item.dateStr}
                className={`bg-stone-50/80 rounded-xl p-3 border transition-all hover:bg-white hover:shadow-xs group flex flex-col items-center justify-between text-center ${
                  isTodayItem ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-stone-200'
                }`}
              >
                {/* Date header */}
                <div className="w-full flex items-center justify-between mb-1.5 text-[10px]">
                  <span
                    className={`font-mono font-semibold px-1.5 py-0.5 rounded ${
                      isTodayItem ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isTodayItem ? 'Today' : `+${idx}d`}
                  </span>
                  <span className="text-stone-500 font-medium">{item.dateStr}</span>
                </div>

                {/* QR Image */}
                <div className="my-1 p-1 bg-white rounded border border-stone-200/70">
                  {item.dataUrl && (
                    <img
                      src={item.dataUrl}
                      alt={item.formattedString}
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>

                {/* String preview & download */}
                <div className="w-full mt-2 pt-2 border-t border-stone-200/60">
                  <div
                    className="text-[10px] font-mono text-stone-700 truncate font-semibold mb-1"
                    title={item.formattedString}
                  >
                    {item.formattedString}
                  </div>
                  <button
                    type="button"
                    onClick={() => item.dataUrl && downloadDataUrl(item.dataUrl, item.fileName)}
                    className="w-full py-1 px-1.5 rounded bg-white hover:bg-stone-900 hover:text-white border border-stone-300 text-stone-700 text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    PNG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
