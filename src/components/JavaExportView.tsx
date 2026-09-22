import React, { useState } from 'react';
import { QRConfig } from '../types';
import { generateJavaSourceCode, generatePomXml } from '../utils/javaCodeGenerator';
import { downloadTextFile } from '../utils/exportUtils';
import { Code2, Copy, Check, Download, Folder, Terminal, Sparkles, Cpu } from 'lucide-react';

interface JavaExportViewProps {
  config: QRConfig;
}

export const JavaExportView: React.FC<JavaExportViewProps> = ({ config }) => {
  const [localFolderPath, setLocalFolderPath] = useState<string>('C:/qr_codes');
  const [copiedJava, setCopiedJava] = useState<boolean>(false);
  const [copiedPom, setCopiedPom] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'java' | 'pom'>('java');

  const javaCode = generateJavaSourceCode(config, localFolderPath);
  const pomXml = generatePomXml();

  const handleCopy = async (type: 'java' | 'pom') => {
    try {
      const textToCopy = type === 'java' ? javaCode : pomXml;
      await navigator.clipboard.writeText(textToCopy);
      if (type === 'java') {
        setCopiedJava(true);
        setTimeout(() => setCopiedJava(false), 2000);
      } else {
        setCopiedPom(true);
        setTimeout(() => setCopiedPom(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleDownloadJava = () => {
    downloadTextFile(javaCode, 'DailyQRGenerator.java', 'text/x-java-source');
  };

  const handleDownloadPom = () => {
    downloadTextFile(pomXml, 'pom.xml', 'application/xml');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Java Daemon & Local Folder Automation Script
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Full standalone Java 17+ program using Google ZXing to generate date-loop QR codes and schedule daily morning updates
          </p>
        </div>

        {/* Quick Action Downloads */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadJava}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download DailyQRGenerator.java
          </button>
          <button
            type="button"
            onClick={handleDownloadPom}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-stone-500" />
            Download pom.xml
          </button>
        </div>
      </div>

      {/* Local Folder Customization */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Folder className="w-4 h-4 text-amber-600 shrink-0" />
          <label htmlFor="java-folder-input" className="font-semibold text-stone-700 shrink-0">
            Target Local PC Folder:
          </label>
          <input
            type="text"
            id="java-folder-input"
            value={localFolderPath}
            onChange={(e) => setLocalFolderPath(e.target.value)}
            placeholder="e.g. C:/qr_codes or ./output"
            className="w-full sm:w-72 font-mono text-xs px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div className="text-stone-500 text-[11px] self-start sm:self-auto">
          Java script will automatically create this directory if it doesn't exist.
        </div>
      </div>

      {/* Code Viewer Tabs & Copy */}
      <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 shadow-md">
        {/* Tab Bar */}
        <div className="bg-stone-900 px-4 py-2.5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCodeTab('java')}
              className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                activeCodeTab === 'java'
                  ? 'bg-stone-800 text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              DailyQRGenerator.java
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('pom')}
              className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                activeCodeTab === 'pom'
                  ? 'bg-stone-800 text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              pom.xml (Dependencies)
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(activeCodeTab)}
            className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md transition-colors"
          >
            {(activeCodeTab === 'java' ? copiedJava : copiedPom) ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="p-4 overflow-x-auto max-h-[460px] text-xs font-mono leading-relaxed text-stone-300">
          <pre>{activeCodeTab === 'java' ? javaCode : pomXml}</pre>
        </div>
      </div>

      {/* How to Run Instructions */}
      <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
          <Terminal className="w-4 h-4 text-stone-700" />
          <span>How to Run on Your Local Computer</span>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-stone-600">
          <li>
            <strong className="text-stone-800">Download the files:</strong> Click{' '}
            <code className="bg-stone-200 px-1 rounded text-stone-900 font-mono">
              DailyQRGenerator.java
            </code>{' '}
            and <code className="bg-stone-200 px-1 rounded text-stone-900 font-mono">pom.xml</code>{' '}
            above.
          </li>
          <li>
            <strong className="text-stone-800">Place in project structure:</strong>
            <pre className="mt-1 p-2 bg-stone-100 rounded text-[11px] font-mono text-stone-700">
              my-qr-project/{'\n'}
              ├── pom.xml{'\n'}
              └── src/main/java/com/example/qr/DailyQRGenerator.java
            </pre>
          </li>
          <li>
            <strong className="text-stone-800">Run with Maven in your terminal:</strong>
            <div className="mt-1 p-2.5 bg-stone-900 text-amber-300 rounded font-mono text-xs flex items-center justify-between">
              <code>mvn compile exec:java</code>
            </div>
          </li>
          <li>
            <strong className="text-stone-800">Automated Execution:</strong>
            <p className="mt-0.5 text-stone-600">
              The program immediately generates today&apos;s QR code, runs the batch date loop, and keeps a background timer active that automatically executes each morning at midnight to write the new daily QR image to{' '}
              <code className="text-stone-900 font-mono bg-stone-200 px-1 rounded">
                {localFolderPath}
              </code>
              .
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};
