import { useEffect, useState } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import type { Administrator } from '../services/settingsStore';

interface Props {
  administrators: Administrator[];
  onClose: () => void;
  onAuthorized: (admin: Administrator) => void;
}

/** Waits for a badge scan and checks it against the administrators maintained on this device. */
export function AdminScanModal({ administrators, onClose, onAuthorized }: Props) {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useBarcodeScanner(true, (badgeId) => {
    const admin = administrators.find((a) => a.id === badgeId.trim());
    if (admin) onAuthorized(admin);
    else setDenied(true);
  });

  return (
    <div className="backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="admin-scan-title">
        <div className="panel__header">
          <h2 id="admin-scan-title">Administrator Access</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={`scan ${denied ? 'scan--denied' : ''}`}>
          <svg className="scan__icon" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="12" y="6" width="40" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="24" y="2" width="16" height="8" rx="3" fill="currentColor" />
            <circle cx="32" cy="26" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
            <path
              d="M20 46c2-7 7-10 12-10s10 3 12 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          {!denied && <div className="scan__beam" />}
        </div>

        <p className="modal__message" role="status">
          {denied ? (
            <span className="text-error">Access denied. This badge is not an administrator.</span>
          ) : (
            'Please scan an administrator badge.'
          )}
        </p>
        <p className="modal__hint">
          {denied ? 'Scan another badge to try again.' : 'Settings require administrator rights.'}
        </p>

        <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
