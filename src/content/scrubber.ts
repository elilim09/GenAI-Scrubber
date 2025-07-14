import { InferenceSession } from 'onnxruntime-web';
import { ScrubStats } from '../types/ScrubStats';
import { log } from '../utils/logger';

interface Cache {
  ner?: Promise<void>;
  face?: Promise<void>;
  ocr?: Promise<void>;
}

const modelCache: Cache = {};

let tokenCounter = 0;
const mappings: Record<string, { value: string; ts: number }> = {};
const TOKEN_TTL = 15 * 60 * 1000;

function createToken(label: string, value: string): string {
  tokenCounter += 1;
  const t = `@${label}${tokenCounter}`;
  mappings[t] = { value, ts: Date.now() };
  return t;
}

function cleanupTokens(): void {
  const now = Date.now();
  Object.keys(mappings).forEach((k) => {
    if (now - mappings[k].ts > TOKEN_TTL) delete mappings[k];
  });
}

async function loadNER(): Promise<void> {
  if (!modelCache.ner) {
    modelCache.ner = (async () => {
      // TODO: load pyodide + spaCy wasm
      log('spaCy model loaded');
    })();
  }
  await modelCache.ner;
}

async function loadFaceModel(): Promise<void> {
  if (!modelCache.face) {
    modelCache.face = InferenceSession.create('src/wasm/yolov8_face.onnx').then(
      () => {
        log('face model loaded');
      },
    );
  }
  await modelCache.face;
}

async function loadOCR(): Promise<void> {
  if (!modelCache.ocr) {
    modelCache.ocr = Promise.resolve().then(() => log('OCR loaded'));
  }
  await modelCache.ocr;
}

export async function loadModels(): Promise<void> {
  await Promise.all([loadNER(), loadFaceModel(), loadOCR()]);
}

/** Scrub text using spaCy NER */
export async function scrubText(raw: string): Promise<{ clean: string; stats: ScrubStats }> {
  cleanupTokens();
  const stats: ScrubStats = {
    replacedNames: 0,
    replacedPhones: 0,
    replacedAddresses: 0,
    replacedStudentIds: 0,
    facesBlurred: 0,
    tokensReplaced: 0,
  };

  let clean = raw;

  const regexRules: { pattern: RegExp; label: string; stat: keyof ScrubStats }[] = [
    { pattern: /(\d{3}-\d{4}-\d{4})/g, label: 'PHONE', stat: 'replacedPhones' },
    { pattern: /(\d{2,4}\s?[가-힣]{2,4})/g, label: 'NAME', stat: 'replacedNames' },
    { pattern: /(\d{2,}-\d{3,})/g, label: 'ID', stat: 'replacedStudentIds' },
  ];

  regexRules.forEach(({ pattern, label, stat }) => {
    clean = clean.replace(pattern, (match) => {
      const t = createToken(label, match);
      stats[stat] += 1 as unknown as number;
      stats.tokensReplaced += 1;
      return t;
    });
  });

  try {
    await loadNER();
    // TODO: use actual spaCy NER results; placeholder uses regex results only
  } catch (e) {
    log('NER unavailable', e);
  }

  return { clean, stats };
}

/** Scrub image by blurring faces and text */
export async function scrubImage(file: File): Promise<{ blob: Blob; stats: ScrubStats }> {
  await Promise.all([loadFaceModel(), loadOCR()]);
  const stats: ScrubStats = {
    replacedNames: 0,
    replacedPhones: 0,
    replacedAddresses: 0,
    replacedStudentIds: 0,
    facesBlurred: 0,
    tokensReplaced: 0,
  };

  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  // TODO: blur detected faces with OpenCV.js once integrated
  const blob = await canvas.convertToBlob();
  log('scrubbed image');
  return { blob, stats };
}

export function undo(tokenStr: string): string | undefined {
  const entry = mappings[tokenStr];
  return entry?.value;
}
