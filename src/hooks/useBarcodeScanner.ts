import { useEffect, useRef } from 'react';

/** Characters older than this are discarded, so stray keypresses don't prefix the next scan. */
const BUFFER_RESET_MS = 2000;

/**
 * Listens for keyboard-wedge barcode/badge scanners while `enabled`.
 * Scanners "type" the code and finish with Enter (or Tab); the completed
 * code is passed to `onScan`. Keystrokes aimed at text fields are ignored.
 */
export function useBarcodeScanner(enabled: boolean, onScan: (code: string) => void) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!enabled) return;
    let buffer = '';
    let lastKeyAt = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      if (now - lastKeyAt > BUFFER_RESET_MS) buffer = '';
      lastKeyAt = now;

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const code = buffer.trim();
        buffer = '';
        if (code) onScanRef.current(code);
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
