import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ClockDisplay } from './components/ClockDisplay';
import { ManualEntryPopover } from './components/ManualEntryPopover';
import { AdminScanModal } from './components/AdminScanModal';
import { SettingsPage } from './components/SettingsPage';
import { StatusBanner, type BannerMessage } from './components/StatusBanner';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { recordPunch } from './services/employeeService';
import {
  loadSettings,
  saveSettings,
  type Administrator,
  type DeviceSettings,
  type ThemeName,
} from './services/settingsStore';

type Overlay =
  | { kind: 'none' }
  | { kind: 'manual' }
  | { kind: 'adminScan' }
  | { kind: 'settings'; admin: Administrator | null };

/** Return to the clock screen after this long without interaction. */
const IDLE_MS = 60_000;
const SETTINGS_IDLE_MS = 180_000;
/** How long the scan result banner stays on screen. */
const BANNER_MS = 4000;

export default function App() {
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' });
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const bannerKey = useRef(0);
  const [settings, setSettings] = useState<DeviceSettings>(loadSettings);
  /** Theme being tried out on the Settings page; discarded unless saved. */
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);

  const close = useCallback(() => {
    setOverlay({ kind: 'none' });
    setPreviewTheme(null);
  }, []);

  const theme = previewTheme ?? settings.theme;
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useIdleTimeout(overlay.kind !== 'none', overlay.kind === 'settings' ? SETTINGS_IDLE_MS : IDLE_MS, close);

  const openSettings = () => {
    // With no administrators maintained, Settings opens without a scan.
    if (settings.administrators.length === 0) setOverlay({ kind: 'settings', admin: null });
    else setOverlay({ kind: 'adminScan' });
  };

  const handleSave = (next: DeviceSettings) => {
    setSettings(next);
    saveSettings(next);
    close();
  };

  const title = [settings.companyName, settings.gateName].filter(Boolean);

  const showBanner = useCallback((msg: Omit<BannerMessage, 'key'>) => {
    setBanner({ ...msg, key: ++bannerKey.current });
  }, []);

  useEffect(() => {
    if (!banner || banner.kind === 'info') return;
    const t = window.setTimeout(() => setBanner(null), BANNER_MS);
    return () => window.clearTimeout(t);
  }, [banner]);

  // The home screen is always ready for a scan whenever no popup is open.
  useBarcodeScanner(overlay.kind === 'none', async (code) => {
    showBanner({ kind: 'info', title: 'Processing scan…' });
    try {
      await recordPunch(code, 'scan');
      showBanner({ kind: 'ok', title: 'Scan successful', detail: `Employee ID ${code}` });
    } catch (err) {
      showBanner({
        kind: 'error',
        title: 'Scan failed',
        detail: err instanceof Error ? err.message : 'Please try again or use Manual Entry.',
      });
    }
  });

  return (
    <main className="screen">
      <header className="screen__top">
        <div />
        {/* The scan result temporarily takes the title's place at the top center. */}
        {banner ? (
          <StatusBanner message={banner} />
        ) : (
          <div className="site-title">
            {settings.companyName && <div className="site-title__company">{settings.companyName}</div>}
            {settings.gateName && <div className="site-title__gate">{settings.gateName}</div>}
            {title.length === 0 && <div className="site-title__gate">Time Clock</div>}
          </div>
        )}
        <div className="manual-anchor">
          <button
            type="button"
            className="btn btn--inverse"
            onClick={() => setOverlay({ kind: 'manual' })}
            aria-haspopup="dialog"
            aria-expanded={overlay.kind === 'manual'}
          >
            Manual Entry
          </button>
          {overlay.kind === 'manual' && <ManualEntryPopover onClose={close} />}
        </div>
      </header>

      <section className="screen__center">
        <ClockDisplay />
      </section>

      <p className="scan-hint">
        <span className="scan-hint__dot" aria-hidden="true" />
        Ready — scan your badge
      </p>

      <footer className="screen__bottom">
        <button
          type="button"
          className="icon-btn icon-btn--lg"
          onClick={openSettings}
          aria-label="Settings"
        >
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.84a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.67 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
            />
          </svg>
        </button>
      </footer>

      {overlay.kind === 'adminScan' && (
        <AdminScanModal
          administrators={settings.administrators}
          onClose={close}
          onAuthorized={(admin) => setOverlay({ kind: 'settings', admin })}
        />
      )}
      {overlay.kind === 'settings' && (
        <SettingsPage
          settings={settings}
          signedInAs={overlay.admin}
          onPreviewTheme={setPreviewTheme}
          onSave={handleSave}
          onClose={close}
        />
      )}
    </main>
  );
}
