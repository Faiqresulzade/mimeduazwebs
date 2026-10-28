import type { KsqLetter, KsqResult, KsqTest, KsqVariant } from '../types';

export const KSQ_LETTERS: KsqLetter[] = ['A', 'B', 'C', 'D', 'E'];
export const KSQ_VARIANTS: KsqVariant[] = ['A', 'B'];

export const KSQ_MAX_CLOSED = 60;
export const KSQ_MAX_OPEN = 10;

export interface KsqPreset {
  label: string;
  closed: number[];
  open: number[];
}

export const KSQ_PRESETS: KsqPreset[] = [
  { label: '15 sual (14+1)', closed: [4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 7, 7, 8, 8], open: [20] },
  { label: '16 sual (13+3)', closed: [4, 4, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], open: [9, 9, 10] },
  { label: '16 sual (14+2)', closed: [4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 7, 7, 8, 8], open: [10, 10] },
  {
    label: '20 sual (18+2)',
    closed: [2, 2, 2, 2, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 7, 7, 8, 8],
    open: [10, 10],
  },
];

/** Massivi verilən uzunluğa gətirir: artıq elementlər kəsilir, çatmayanlar `fill` ilə doldurulur. */
export function normalize<T>(list: T[], length: number, fill: T): T[] {
  const result = list.slice(0, length);
  while (result.length < length) result.push(fill);
  return result;
}

/** Bal massivini böyüdəndə yeni sual əvvəlki sualın balını alır (yoxdursa 1). */
export function normalizePoints(points: number[], length: number): number[] {
  return normalize(points, length, points.length ? points[points.length - 1] : 1);
}

/** Variantın açarı yalnız bütün qapalı suallara cavab seçiləndə hazırdır. */
export function keyReady(key: (KsqLetter | null)[], closedCount: number): boolean {
  return closedCount > 0 && key.length === closedCount && key.every((k) => k !== null);
}

export function variantKey(test: Pick<KsqTest, 'keyA' | 'keyB'>, variant: KsqVariant) {
  return variant === 'B' ? test.keyB : test.keyA;
}

export function readyVariants(test: KsqTest): KsqVariant[] {
  return KSQ_VARIANTS.filter((v) => keyReady(variantKey(test, v), test.closedPoints.length));
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export interface KsqScore {
  bal: number;
  max: number;
  sehv: number[];
}

/**
 * Backend-dəki `KsqScoring.Compute` ilə eyni qayda. Qapalı sual: açarla üst-üstə düşürsə
 * sualın balı, əks halda (boş da daxil) səhv. Açıq sual: 0 ilə sualın maksimumu arasında kəsilir.
 */
export function computeScore(
  closedPoints: number[],
  openPoints: number[],
  key: (KsqLetter | null)[],
  answers: (KsqLetter | null)[],
  openScores: (number | null)[],
): KsqScore {
  let bal = 0;
  const sehv: number[] = [];

  closedPoints.forEach((points, i) => {
    const correct = key[i] ?? null;
    if (correct !== null && answers[i] === correct) bal += points;
    else sehv.push(i + 1);
  });

  openPoints.forEach((points, j) => {
    const value = openScores[j] ?? 0;
    bal += Math.min(Math.max(value, 0), points);
  });

  return { bal, max: sum(closedPoints) + sum(openPoints), sehv };
}

/** 12.5 → "12,5"; tam ədəd olduğu kimi. */
export function formatScore(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}

/* ---------- Şəkil ---------- */

const MAX_IMAGE_SIDE = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Telefon şəkli 4000px+ və bir neçə MB olur. Yükləmədən əvvəl uzun tərəf 1600px-ə
 * endirilir və JPEG-ə çevrilir — kart oxumaq üçün kifayətdir, trafik 10 dəfə azalır.
 */
export async function downscaleImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Şəkil hazırlana bilmədi.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Şəkil hazırlana bilmədi.'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
}

/* ---------- CSV ---------- */

const CSV_SEPARATOR = ';';

function csvCell(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function csvDate(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/**
 * Excel (az/ru lokalı) nöqtəli vergülü sütun ayırıcısı kimi tanıyır, kəsr hissəni vergüllə yazır.
 * UTF-8 BOM olmadan Excel "ə", "ş" hərflərini pozur.
 */
export function buildResultsCsv(results: KsqResult[]): string {
  const header = [
    'Test',
    'Sinif',
    'Şagird',
    'Variant',
    'Kod',
    'Bal',
    'Maksimum bal',
    'Faiz',
    'Səhv suallar',
    'Cavablar',
    'Açıq suallar',
    'Tarix',
  ];

  const rows = results.map((r) => [
    r.test,
    r.sinif,
    r.ad,
    r.variant,
    r.kod,
    formatScore(r.bal),
    formatScore(r.max),
    r.max > 0 ? `${Math.round((r.bal / r.max) * 100)}%` : '',
    r.sehv.join(', '),
    r.cavablar.map((c) => c ?? '-').join(''),
    r.aciq.map(formatScore).join(', '),
    csvDate(r.ts),
  ]);

  const lines = [header, ...rows].map((row) => row.map(csvCell).join(CSV_SEPARATOR));
  return `﻿${lines.join('\r\n')}`;
}

export function downloadCsv(content: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function csvFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `ksq-neticeler-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.csv`;
}
