/**
 * Time punches.
 *
 * When VITE_API_BASE_URL is set, punches are sent to the real API:
 *   POST {base}/punches  -> body { employeeId, source: "scan" | "manual" }
 * Otherwise they are accepted locally so the kiosk UI can be demoed offline.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type PunchSource = 'scan' | 'manual';

export async function recordPunch(employeeId: string, source: PunchSource): Promise<void> {
  const id = employeeId.trim();
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/punches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: id, source }),
    });
    if (!res.ok) throw new Error(`Submission failed (${res.status}).`);
    return;
  }
  await delay(400);
}
