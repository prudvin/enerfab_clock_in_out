import { FormEvent, useState } from 'react';
import type { Administrator, DeviceSettings, ThemeName } from '../services/settingsStore';

interface Props {
  settings: DeviceSettings;
  /** The administrator who opened Settings, or null when no administrators are maintained. */
  signedInAs: Administrator | null;
  onPreviewTheme: (theme: ThemeName) => void;
  onSave: (settings: DeviceSettings) => void;
  onClose: () => void;
}

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'orange', label: 'Orange' },
  { value: 'green', label: 'Green' },
];

export function SettingsPage({ settings, signedInAs, onPreviewTheme, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<DeviceSettings>(settings);
  const [newAdminId, setNewAdminId] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminError, setAdminError] = useState('');

  const selectTheme = (theme: ThemeName) => {
    setDraft((d) => ({ ...d, theme }));
    onPreviewTheme(theme); // show the selection live; the parent clears it on save/close
  };

  const set = <K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addAdmin = () => {
    const id = newAdminId.trim();
    if (!id) {
      setAdminError('Scan or enter a badge ID.');
      return;
    }
    if (draft.administrators.some((a) => a.id === id)) {
      setAdminError(`Badge ${id} is already an administrator.`);
      return;
    }
    set('administrators', [...draft.administrators, { id, name: newAdminName.trim() }]);
    setNewAdminId('');
    setNewAdminName('');
    setAdminError('');
  };

  const removeAdmin = (id: string) =>
    set(
      'administrators',
      draft.administrators.filter((a) => a.id !== id),
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...draft,
      companyName: draft.companyName.trim(),
      gateName: draft.gateName.trim(),
    });
  };

  return (
    <div className="page" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <form className="page__inner" onSubmit={submit}>
        <header className="page__header">
          <div>
            <h1 id="settings-title">Settings</h1>
            <p className="page__sub">
              {signedInAs
                ? `Signed in as ${signedInAs.name || 'Administrator'} (badge ${signedInAs.id})`
                : 'No administrators are set up — Settings is open to everyone.'}
            </p>
          </div>
          <div className="page__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </div>
        </header>

        <section className="card">
          <h2>Display</h2>
          <p className="card__hint">Shown at the top center of the clock screen.</p>
          <div className="grid-2">
            <label className="field">
              <span className="field__label">Company name</span>
              <input
                className="field__input field__input--text"
                value={draft.companyName}
                maxLength={60}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="e.g. Enerfab"
              />
            </label>
            <label className="field">
              <span className="field__label">Gate name</span>
              <input
                className="field__input field__input--text"
                value={draft.gateName}
                maxLength={60}
                onChange={(e) => set('gateName', e.target.value)}
                placeholder="e.g. North Gate"
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Theme</h2>
          <div className="theme-options" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={draft.theme === t.value}
                className={`theme-option theme-option--${t.value} ${draft.theme === t.value ? 'is-selected' : ''}`}
                onClick={() => selectTheme(t.value)}
              >
                <span className="theme-option__swatch" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Administrators</h2>
          <p className="card__hint">
            When at least one administrator is listed, opening Settings requires scanning one of these badges.
          </p>

          {draft.administrators.length > 0 ? (
            <ul className="admin-list">
              {draft.administrators.map((a) => (
                <li key={a.id} className="admin-list__item">
                  <span>
                    <strong>{a.id}</strong>
                    {a.name && <span className="admin-list__name"> — {a.name}</span>}
                    {signedInAs?.id === a.id && <span className="tag">You</span>}
                  </span>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeAdmin(a.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No administrators.</p>
          )}

          <div className="admin-add">
            <input
              className="field__input field__input--text"
              value={newAdminId}
              onChange={(e) => {
                setNewAdminId(e.target.value.replace(/\s/g, ''));
                setAdminError('');
              }}
              onKeyDown={(e) => {
                // A badge scanned into this field ends with Enter — add it instead of submitting the form.
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAdmin();
                }
              }}
              placeholder="Badge ID (scan or type)"
              aria-label="New administrator badge ID"
            />
            <input
              className="field__input field__input--text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAdmin();
                }
              }}
              placeholder="Name (optional)"
              aria-label="New administrator name"
            />
            <button type="button" className="btn btn--primary" onClick={addAdmin}>
              Add
            </button>
          </div>
          {adminError && <div className="notice notice--error">{adminError}</div>}
        </section>
      </form>
    </div>
  );
}
