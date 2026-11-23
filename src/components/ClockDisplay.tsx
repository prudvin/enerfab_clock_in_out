import { useNow } from '../hooks/useNow';

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function ClockDisplay() {
  const now = useNow();
  const parts = timeFmt.formatToParts(now);
  const hms = parts
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim();
  const period = parts.find((p) => p.type === 'dayPeriod')?.value;

  return (
    <div className="clock">
      <div className="clock__day">{dayFmt.format(now)}</div>
      <div className="clock__time">
        <time dateTime={now.toISOString()} aria-label={hms}>
          {hms.split(/(:)/).map((part, i) =>
            part === ':' ? (
              <span key={i} className="clock__sep" aria-hidden="true">
                :
              </span>
            ) : (
              <span key={i} aria-hidden="true">
                {part}
              </span>
            ),
          )}
        </time>
        {period && <span className="clock__period">{period}</span>}
      </div>
      <div className="clock__date">{dateFmt.format(now)}</div>
    </div>
  );
}
