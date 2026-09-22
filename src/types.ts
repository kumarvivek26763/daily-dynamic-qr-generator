export type DateFormatOption = 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'YYYY/MM/DD' | 'DD/MM/YYYY' | 'YYYYMMDD';

export interface QRConfig {
  prefix: string; // e.g. '602062'
  suffix: string; // e.g. 'student'
  separator: string; // e.g. '/'
  dateFormat: DateFormatOption;
  customTemplate: string; // e.g. '{prefix}/{date}/{suffix}'
  useCustomTemplate: boolean;
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeLabel: boolean;
  labelText: string;
}

export interface GeneratedDayQR {
  date: Date;
  dateStr: string;
  formattedString: string;
  dataUrl?: string;
  fileName: string;
}

export interface JavaConfig {
  prefix: string;
  suffix: string;
  folderPath: string;
  hourOfDay: number; // 0 for midnight, 6 for 6 AM
  batchDays: number;
}
