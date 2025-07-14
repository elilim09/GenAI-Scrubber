import { scrubText, scrubImage } from './scrubber';
import { log } from '../utils/logger';

function handlePaste(ev: ClipboardEvent): void {
  const clipboardData = ev.clipboardData;
  if (!clipboardData) return;
  const text = clipboardData.getData('text');
  if (text) {
    ev.preventDefault();
    scrubText(text)
      .then(({ clean }) => {
        clipboardData.setData('text/plain', clean);
        document.execCommand('insertText', false, clean);
      })
      .catch((err) => log('paste scrub failed', err));
  }
}

document.addEventListener('paste', handlePaste, true);

document.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.type === 'file' && target.files?.length) {
    const file = target.files[0];
    scrubImage(file)
      .then(({ blob }) => {
        const dt = new DataTransfer();
        dt.items.add(new File([blob], file.name, { type: file.type }));
        target.files = dt.files;
      })
      .catch((err) => log('image scrub failed', err));
  }
});

document.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (!dt) return;
  const items = Array.from(dt.items);
  items.forEach((item) => {
    if (item.kind === 'string') {
      item.getAsString(async (text) => {
        const { clean } = await scrubText(text).catch((err) => {
          log('drop text scrub failed', err);
          return { clean: text };
        });
        dt.setData('text/plain', clean);
      });
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        scrubImage(file)
          .then(({ blob }) => {
            dt.items.add(new File([blob], file.name, { type: file.type }));
          })
          .catch((err) => log('drop image scrub failed', err));
      }
    }
  });
}, true);

document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[type="text"], textarea',
  );
  fields.forEach(async (f) => {
    const { clean } = await scrubText(f.value).catch(() => ({ clean: f.value }));
    f.value = clean;
  });
});
