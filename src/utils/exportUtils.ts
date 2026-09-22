import JSZip from 'jszip';
import { GeneratedDayQR } from '../types';

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadTextFile(content: string, fileName: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToZip(items: GeneratedDayQR[], zipName: string = 'daily_qr_codes.zip'): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('qr_codes') || zip;

  for (const item of items) {
    if (item.dataUrl) {
      // base64 png data
      const base64Data = item.dataUrl.replace(/^data:image\/png;base64,/, '');
      folder.file(item.fileName, base64Data, { base64: true });
    }
  }

  // Also include a metadata summary list (summary.csv or readme.txt)
  const manifestContent = [
    'Date,File Name,QR Text String',
    ...items.map((it) => `"${it.dateStr}","${it.fileName}","${it.formattedString}"`),
  ].join('\n');
  folder.file('manifest.csv', manifestContent);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Attempts to use the native browser File System Access API to save into an actual chosen local directory
export async function exportToLocalDirectoryPicker(items: GeneratedDayQR[]): Promise<{ success: boolean; count: number; message: string }> {
  // Check if showDirectoryPicker is supported in this browser context
  // @ts-expect-error File System Access API may not be declared on window in some ts configs
  if (typeof window.showDirectoryPicker !== 'function') {
    return {
      success: false,
      count: 0,
      message: 'Native folder access is not supported in this browser. Please use the ZIP download option instead.',
    };
  }

  try {
    // @ts-expect-error window.showDirectoryPicker
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    let savedCount = 0;
    for (const item of items) {
      if (!item.dataUrl) continue;
      const fileHandle = await dirHandle.getFileHandle(item.fileName, { create: true });
      const writable = await fileHandle.createWritable();

      // Convert base64 dataUrl to Blob
      const response = await fetch(item.dataUrl);
      const blob = await response.blob();

      await writable.write(blob);
      await writable.close();
      savedCount++;
    }

    return {
      success: true,
      count: savedCount,
      message: `Successfully saved ${savedCount} QR code files to the selected local folder!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('abort') || errorMsg.includes('cancel')) {
      return { success: false, count: 0, message: 'Folder selection was canceled.' };
    }
    return {
      success: false,
      count: 0,
      message: `Direct folder access failed (${errorMsg}). You can use ZIP export to save the files!`,
    };
  }
}
