import { FormEvent, useEffect, useRef, useState } from 'react';
import { Keypad } from './Keypad';
import { recordPunch } from '../services/employeeService';

interface Props {
  onClose: () => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; id: string }
  | { kind: 'error'; msg: string };

const MAX_LEN = 12;

export function ManualEntryPopover({ onClose }: Props) {
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  // Close automatically shortly after a successful entry.
  useEffect(() => {
    if (status.kind !== 'ok') return;
    const t = window.setTimeout(onClose, 2500);
    return () => window.clearTimeout(t);
  }, [status, onClose]);

  const update = (next: string) => {
    if (status.kind === 'busy') return;
    setStatus({ kind: 'idle' });
    setEmployeeId(next.replace(/\s/g, '').slice(0, MAX_LEN));
    inputRef.current?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || status.kind === 'busy') return;
    setStatus({ kind: 'busy' });
    try {
      await recordPunch(employeeId, 'manual');
      setStatus({ kind: 'ok', id: employeeId.trim() });
    } catch (err) {
      setStatus({ kind: 'error', msg: err instanceof Error ? err.message : 'Submission failed.' });
    }
  };

  return (
    <>
      <div className="backdrop backdrop--clear" onClick={onClose} />
      <div className="popover" role="dialog" aria-modal="true" aria-labelledby="manual-entry-title">
        <div className="popover__arrow" />
        <div className="panel__header">
          <h2 id="manual-entry-title">Manual Entry</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {status.kind === 'ok' ? (
          <div className="notice notice--ok" role="status">
            Entry recorded for employee <strong>{status.id}</strong>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="field">
              <span className="field__label">Employee ID</span>
              <input
                ref={inputRef}
                className="field__input"
                inputMode="numeric"
                autoComplete="off"
                value={employeeId}
                onChange={(e) => update(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                placeholder="Enter ID"
              />
            </label>

            <Keypad
              onDigit={(d) => update(employeeId + d)}
              onBackspace={() => update(employeeId.slice(0, -1))}
              onClear={() => update('')}
            />

            {status.kind === 'error' && <div className="notice notice--error">{status.msg}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={!employeeId.trim() || status.kind === 'busy'}
            >
              {status.kind === 'busy' ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
