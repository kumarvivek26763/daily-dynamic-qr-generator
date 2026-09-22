import React from 'react';
import { QRConfig, DateFormatOption } from '../types';
import { buildDynamicString } from '../utils/dateUtils';
import { Settings2, Sliders, Calendar, Type, Palette } from 'lucide-react';

interface TemplateConfigProps {
  config: QRConfig;
  onChange: (updated: QRConfig) => void;
  referenceDate: Date;
}

export const TemplateConfig: React.FC<TemplateConfigProps> = ({ config, onChange, referenceDate }) => {
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayString = buildDynamicString(
    referenceDate,
    config.prefix,
    config.suffix,
    config.separator,
    config.dateFormat,
    config.customTemplate,
    config.useCustomTemplate
  );

  const tomorrowString = buildDynamicString(
    tomorrow,
    config.prefix,
    config.suffix,
    config.separator,
    config.dateFormat,
    config.customTemplate,
    config.useCustomTemplate
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-stone-700" />
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            Template & String Builder
          </h2>
        </div>
        <span className="text-xs text-stone-500 font-mono">Dynamic Pattern</span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Prefix / Roll code */}
        <div>
          <label htmlFor="prefix-input" className="block text-xs font-semibold text-stone-700 mb-1">
            Roll Code / Prefix
          </label>
          <div className="relative">
            <input
              type="text"
              id="prefix-input"
              value={config.prefix}
              onChange={(e) => onChange({ ...config, prefix: e.target.value })}
              placeholder="e.g. 602062"
              className="w-full text-sm font-mono px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Example: Roll number, ID, or dept</p>
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="date-format-select" className="block text-xs font-semibold text-stone-700 mb-1">
            Date Format
          </label>
          <select
            id="date-format-select"
            value={config.dateFormat}
            onChange={(e) => onChange({ ...config, dateFormat: e.target.value as DateFormatOption })}
            className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-22)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (22-09-2026)</option>
            <option value="YYYY/MM/DD">YYYY/MM/DD (2026/09/22)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (22/09/2026)</option>
            <option value="YYYYMMDD">YYYYMMDD (20260922)</option>
          </select>
          <p className="text-[11px] text-stone-400 mt-1">Updates dynamically every day</p>
        </div>

        {/* Suffix / Role */}
        <div>
          <label htmlFor="suffix-input" className="block text-xs font-semibold text-stone-700 mb-1">
            Suffix / Role
          </label>
          <input
            type="text"
            id="suffix-input"
            value={config.suffix}
            onChange={(e) => onChange({ ...config, suffix: e.target.value })}
            placeholder="e.g. student"
            className="w-full text-sm font-mono px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          <p className="text-[11px] text-stone-400 mt-1">Role or extra token</p>
        </div>
      </div>

      {/* Separator & Advanced Template */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <div className="flex items-center gap-2">
          <label htmlFor="separator-input" className="text-xs font-semibold text-stone-700">
            Separator:
          </label>
          <input
            type="text"
            id="separator-input"
            value={config.separator}
            onChange={(e) => onChange({ ...config, separator: e.target.value })}
            className="w-12 text-center text-sm font-mono px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="custom-template-toggle"
            checked={config.useCustomTemplate}
            onChange={(e) => onChange({ ...config, useCustomTemplate: e.target.checked })}
            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="custom-template-toggle" className="text-xs font-medium text-stone-700 cursor-pointer">
            Use custom formula template
          </label>
        </div>

        {config.useCustomTemplate && (
          <div className="w-full mt-1">
            <input
              type="text"
              id="custom-template-input"
              value={config.customTemplate}
              onChange={(e) => onChange({ ...config, customTemplate: e.target.value })}
              placeholder="{prefix}/{date}/{suffix}"
              className="w-full text-xs font-mono px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Placeholders: <code className="text-stone-600">{"{prefix}"}</code>, <code className="text-stone-600">{"{date}"}</code>, <code className="text-stone-600">{"{suffix}"}</code>
            </p>
          </div>
        )}
      </div>

      {/* Dynamic String Evaluation Preview Card */}
      <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 space-y-2">
        <div className="text-xs font-semibold text-stone-700 flex items-center justify-between">
          <span>Evaluated Dynamic Output</span>
          <span className="text-[11px] font-normal text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-sm">
            Live Daily String
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-stone-200">
            <span className="text-stone-400 font-medium block text-[10px] uppercase">Today's QR String</span>
            <code className="text-stone-900 font-mono font-semibold break-all text-sm">{todayString}</code>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-stone-200">
            <span className="text-stone-400 font-medium block text-[10px] uppercase">Tomorrow's String (Automatic Next Day)</span>
            <code className="text-amber-800 font-mono font-semibold break-all text-sm">{tomorrowString}</code>
          </div>
        </div>
      </div>

      {/* QR Code Graphic Options (Collapsible / Compact) */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Size */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <label htmlFor="qr-size-select" className="text-stone-600">Size:</label>
            <select
              id="qr-size-select"
              value={config.size}
              onChange={(e) => onChange({ ...config, size: Number(e.target.value) })}
              className="text-xs bg-stone-50 border border-stone-300 rounded px-2 py-1"
            >
              <option value={260}>Small (260px)</option>
              <option value={350}>Standard (350px)</option>
              <option value={500}>High-Res (500px)</option>
              <option value={800}>Ultra HD (800px)</option>
            </select>
          </div>

          {/* Error Correction */}
          <div className="flex items-center gap-2">
            <label htmlFor="error-correction-select" className="text-stone-600">Error Correction:</label>
            <select
              id="error-correction-select"
              value={config.errorCorrectionLevel}
              onChange={(e) => onChange({ ...config, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
              className="text-xs bg-stone-50 border border-stone-300 rounded px-2 py-1"
            >
              <option value="L">L (7% recovery)</option>
              <option value="M">M (15% recovery)</option>
              <option value="Q">Q (25% recovery)</option>
              <option value="H">H (30% high recovery)</option>
            </select>
          </div>

          {/* Text Caption in Image */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="include-label-toggle"
              checked={config.includeLabel}
              onChange={(e) => onChange({ ...config, includeLabel: e.target.checked })}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="include-label-toggle" className="text-stone-700 cursor-pointer">
              Print Text Caption under QR
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
