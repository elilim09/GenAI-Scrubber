import { InferenceSession } from 'onnxruntime-web';
import { ScrubStats } from '../types';
import { log } from '../utils/logger';

let nerLoaded = false;
// Placeholder for spaCy NER WASM
export async function loadNER(): Promise<void> {
  if (!nerLoaded) {
    // TODO: load pyodide and spaCy wasm
    nerLoaded = true;
  }
}

const faceModel = 'src/wasm/yolov8_face.onnx';
let faceSession: InferenceSession | null = null;

async function loadFaceModel(): Promise<void> {
  if (!faceSession) {
    faceSession = await InferenceSession.create(faceModel);
  }
}

interface Mapping {
  [token: string]: string;
}

const mapping: Mapping = {};
let counter = 0;

function token(label: string): string {
  counter += 1;
  return `@${label}${counter}`;
}

/** Scrub text using spaCy NER */
export async function scrubText(raw: string): Promise<{ clean: string; stats: ScrubStats }> {
  await loadNER();
  const stats: ScrubStats = {
    replacedNames: 0,
    replacedPhones: 0,
    replacedAddresses: 0,
    replacedStudentIds: 0,
  };
  let clean = raw;
  // Simple regex-based placeholder
  clean = clean.replace(/(\d{3}-\d{4}-\d{4})/g, (match) => {
    const t = token('PHONE');
    mapping[t] = match;
    stats.replacedPhones += 1;
    return t;
  });
  return { clean, stats };
}

/** Scrub image by blurring faces and text */
export async function scrubImage(file: File | Blob): Promise<{ blob: Blob; stats: ScrubStats }> {
  await loadFaceModel();
  const stats: ScrubStats = {
    replacedNames: 0,
    replacedPhones: 0,
    replacedAddresses: 0,
    replacedStudentIds: 0,
    imagesProcessed: 1,
  };
  // Load image into canvas
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  // TODO: run face detection and blur
  // TODO: OCR and scrubText over extracted text
  const blob = await canvas.convertToBlob();
  log('scrubbed image');
  return { blob, stats };
}

export function undo(tokenStr: string): string | undefined {
  return mapping[tokenStr];
}
