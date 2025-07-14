import { scrubText, scrubImage } from './scrubber';

function handlePaste(ev: ClipboardEvent): void {
  const clipboardData = ev.clipboardData;
  if (!clipboardData) return;
  const text = clipboardData.getData('text');
  if (text) {
    ev.preventDefault();
    scrubText(text).then(({ clean }) => {
      clipboardData.setData('text/plain', clean);
      document.execCommand('insertText', false, clean);
    });
  }
}

document.addEventListener('paste', handlePaste, true);

document.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.type === 'file' && target.files?.length) {
    const file = target.files[0];
    scrubImage(file).then(({ blob }) => {
      const dt = new DataTransfer();
      dt.items.add(new File([blob], file.name, { type: file.type }));
      target.files = dt.files;
    });
  }
});
