interface KeypadProps {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function Keypad({ onDigit, onBackspace, onClear }: KeypadProps) {
  return (
    <div className="keypad">
      {DIGITS.map((d) => (
        <button key={d} type="button" className="keypad__key" onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button type="button" className="keypad__key keypad__key--muted" onClick={onClear}>
        Clear
      </button>
      <button type="button" className="keypad__key" onClick={() => onDigit('0')}>
        0
      </button>
      <button
        type="button"
        className="keypad__key keypad__key--muted"
        onClick={onBackspace}
        aria-label="Backspace"
      >
        ⌫
      </button>
    </div>
  );
}
