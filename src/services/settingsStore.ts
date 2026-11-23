/**
 * Device settings, stored locally on the kiosk (localStorage) so they survive restarts.
 */

export type ThemeName = 'orange' | 'green';

export interface Administrator {
  id: string;
  name: string;
}

export interface DeviceSettings {
  companyName: string;
  gateName: string;
  theme: ThemeName;
  administrators: Administrator[];
}

const STORAGE_KEY = 'enerfab.clock.settings.v1';

export const DEFAULT_SETTINGS: DeviceSettings = {
  companyName: '',
  gateName: '',
  theme: 'orange',
  administrators: [],
};

export function loadSettings(): DeviceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DeviceSettings>;
    return {
      companyName: typeof parsed.companyName === 'string' ? parsed.companyName : '',
      gateName: typeof parsed.gateName === 'string' ? parsed.gateName : '',
      theme: parsed.theme === 'green' ? 'green' : 'orange',
      administrators: Array.isArray(parsed.administrators)
        ? parsed.administrators.filter((a): a is Administrator => typeof a?.id === 'string' && a.id !== '')
        : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: DeviceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode / quota) — settings still apply for this session.
  }
}

export function findAdministrator(settings: DeviceSettings, badgeId: string): Administrator | undefined {
  const id = badgeId.trim();
  return settings.administrators.find((a) => a.id === id);
}
