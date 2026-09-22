import QRCode from 'qrcode';
import { QRConfig } from '../types';

export async function generateQRDataUrl(text: string, config: QRConfig): Promise<string> {
  const baseOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: config.errorCorrectionLevel,
    width: config.size,
    margin: 2,
    color: {
      dark: config.fgColor,
      light: config.bgColor,
    },
  };

  const qrDataUrl = await QRCode.toDataURL(text, baseOptions);

  if (!config.includeLabel) {
    return qrDataUrl;
  }

  // Draw on an HTML5 canvas to cleanly include text label under the QR
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const labelText = config.labelText || text;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      const labelHeight = 48;
      canvas.width = config.size;
      canvas.height = config.size + labelHeight;

      // Fill background
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR Code
      ctx.drawImage(img, 0, 0);

      // Draw Label
      ctx.fillStyle = config.fgColor;
      ctx.font = '600 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Truncate or wrap if too long
      const maxTextWidth = canvas.width - 16;
      let displayStr = labelText;
      if (ctx.measureText(displayStr).width > maxTextWidth) {
        while (ctx.measureText(displayStr + '...').width > maxTextWidth && displayStr.length > 5) {
          displayStr = displayStr.substring(0, displayStr.length - 1);
        }
        displayStr += '...';
      }

      ctx.fillText(displayStr, canvas.width / 2, config.size + labelHeight / 2 - 2);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = qrDataUrl;
  });
}

export async function generateQRSVG(text: string, config: QRConfig): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: config.errorCorrectionLevel,
    margin: 2,
    color: {
      dark: config.fgColor,
      light: config.bgColor,
    },
  });
}
