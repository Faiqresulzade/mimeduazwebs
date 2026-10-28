import type { KsqLetter, KsqVariant } from '../../../../types';

export type ScanStatus = 'waiting' | 'processing' | 'done' | 'error';

/** Yoxla siyahısındakı bir kart. Şəkil yalnız brauzerdə qalır (önizləmə üçün). */
export interface Scan {
  id: string;
  file: File;
  previewUrl: string;
  status: ScanStatus;
  error: string | null;
  ad: string;
  variant: KsqVariant;
  kod: string;
  cavablar: (KsqLetter | null)[];
  /** Müəllimin açıq suallara yazdığı bal. */
  aciq: (number | null)[];
  /** AI-ın açıq suallarda oxuduğu mətn — yalnız ipucu. */
  aciqText: (string | null)[];
  unsure: number[];
  qeyd: string | null;
  saved: boolean;
  saving: boolean;
  expanded: boolean;
}

/** Eyni anda neçə şəkil oxunur. Limit dəqiqədə 20 olduğu üçün 2 kifayətdir. */
export const SCAN_CONCURRENCY = 2;

export function hasAnyAnswer(scan: Scan) {
  return scan.cavablar.some((c) => c !== null) || scan.aciq.some((a) => a !== null);
}
