export interface BannerMessage {
  /** Changes on every message so repeated identical scans re-trigger the animation. */
  key: number;
  kind: 'ok' | 'error' | 'info';
  title: string;
  detail?: string;
}

export function StatusBanner({ message }: { message: BannerMessage | null }) {
  if (!message) return null;
  return (
    <div key={message.key} className={`banner banner--${message.kind}`} role="status" aria-live="polite">
      <span className="banner__icon" aria-hidden="true">
        {message.kind === 'ok' ? '✓' : message.kind === 'error' ? '!' : '…'}
      </span>
      <div>
        <div className="banner__title">{message.title}</div>
        {message.detail && <div className="banner__detail">{message.detail}</div>}
      </div>
    </div>
  );
}
