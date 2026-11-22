import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cx } from '@/lib/format';
import { Icon } from './Icon';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: (id: string, describedBy?: string) => ReactNode;
}

function FieldShell({ label, error, hint, className, children }: FieldShellProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{label}</label>
      {children(id, error || hint ? msgId : undefined)}
      {(error || hint) && (
        <p id={msgId} role={error ? 'alert' : undefined} className={cx('mt-2 text-xs', error ? 'text-danger [.on-paper_&]:text-danger' : 'text-muted [.on-paper_&]:text-ink/65')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & { label: string; error?: string; hint?: ReactNode; className?: string; end?: ReactNode };

export function TextField({ label, error, hint, className, end, ...input }: InputProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      {(id, describedBy) => (
        <div className="field" data-invalid={Boolean(error)}>
          <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...input} />
          {end}
        </div>
      )}
    </FieldShell>
  );
}

export function PasswordField(props: Omit<InputProps, 'type' | 'end'>) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      dir="ltr"
      className={cx(props.className, '[&_input]:text-end')}
      end={
        <button type="button" onClick={() => setShow((s) => !s)} className="-me-2 grid h-10 w-10 place-items-center rounded-lg opacity-70 hover:opacity-100" aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} aria-pressed={show}>
          <Icon name={show ? 'eye-off' : 'eye'} size={20} />
        </button>
      }
    />
  );
}

export const countries = [
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'السعودية', pattern: /^5\d{8}$/ },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'الإمارات', pattern: /^5\d{8}$/ },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'الكويت', pattern: /^\d{8}$/ },
  { code: 'BH', dial: '+973', flag: '🇧🇭', name: 'البحرين', pattern: /^\d{8}$/ },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'قطر', pattern: /^\d{8}$/ },
  { code: 'OM', dial: '+968', flag: '🇴🇲', name: 'عُمان', pattern: /^\d{8}$/ },
  { code: 'EG', dial: '+20', flag: '🇪🇬', name: 'مصر', pattern: /^1\d{9}$/ },
];

export const validatePhone = (code: string, phone: string) => {
  const c = countries.find((x) => x.code === code) ?? countries[0];
  return c.pattern.test(phone.replace(/^0+/, ''));
};

/** Phone input: country selector (flag + dial code) and a Latin-digit number field. */
export function PhoneField({ label, value, onChange, country, onCountry, error, placeholder, className, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; country: string; onCountry: (c: string) => void; error?: string; placeholder?: string; className?: string; autoFocus?: boolean;
}) {
  const c = countries.find((x) => x.code === country) ?? countries[0];
  return (
    <FieldShell label={label} error={error} className={className} hint={undefined}>
      {(id, describedBy) => (
        <div className="field !gap-0 !pe-0" data-invalid={Boolean(error)}>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            dir="ltr"
            className="text-end tracking-wider"
            placeholder={placeholder ?? (c.code === 'SA' ? '5X XXX XXXX' : '')}
            aria-label={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
          />
          <span className="mx-3 h-6 w-px bg-current opacity-20" aria-hidden="true" />
          <div className="relative flex h-full items-center" dir="ltr">
            {/* a real flag image (Windows has no flag emoji — it shows the letters "SA") */}
            <img src={`/assets/flags/${c.code.toLowerCase()}.svg`} alt="" width={22} height={16} draggable={false} className="pointer-events-none ms-4 h-4 w-[22px] shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgb(0_0_0/.15)]" />
            <select
              aria-label="رمز الدولة"
              value={country}
              onChange={(e) => onCountry(e.target.value)}
              className="h-full !w-auto !flex-none cursor-pointer bg-transparent pe-9 ps-2.5 text-sm outline-none"
              dir="ltr"
            >
              {countries.map((x) => (
                <option key={x.code} value={x.code}>{`${x.dial}`}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3 opacity-60" />
          </div>
        </div>
      )}
    </FieldShell>
  );
}

export function SelectField({ label, options, placeholder, error, className, ...select }: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { label: string; options: string[]; placeholder: string; error?: string; className?: string }) {
  return (
    <FieldShell label={label} error={error} className={className}>
      {(id, describedBy) => (
        <div className="field relative" data-invalid={Boolean(error)}>
          <select id={id} aria-describedby={describedBy} {...select} className={cx(!select.value && 'text-muted')}>
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <Icon name="chevron-down" size={18} className="pointer-events-none shrink-0 text-accent [.on-paper_&]:text-ink" />
        </div>
      )}
    </FieldShell>
  );
}

/** 6-cell OTP input: auto-advance, backspace navigation, paste support. Digits run LTR. */
export function OtpInput({ value, onChange, length = 6, invalid }: { value: string; onChange: (v: string) => void; length?: number; invalid?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setAt = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join('').slice(0, length));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (text) {
      e.preventDefault();
      onChange(text);
      refs.current[Math.min(text.length, length - 1)]?.focus();
    }
  };

  return (
    <div dir="ltr" className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="رمز التحقق">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={i === 0}
          maxLength={1}
          aria-label={`الرقم ${i + 1}`}
          onPaste={onPaste}
          onKeyDown={(e) => onKey(i, e)}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            setAt(i, v);
            if (v && i < length - 1) refs.current[i + 1]?.focus();
          }}
          className={cx(
            'num h-14 w-11 rounded-[12px] bg-container text-center font-display text-2xl font-semibold text-fg outline-none transition-all sm:h-16 sm:w-14',
            'shadow-[inset_0_0_0_1px_rgb(var(--c-line))] focus:shadow-[inset_0_0_0_1px_rgb(var(--c-accent)),0_0_0_4px_rgb(var(--c-accent)/.12)]',
            d && 'shadow-[inset_0_0_0_1px_rgb(var(--c-accent)/.6)]',
            invalid && '!shadow-[inset_0_0_0_1px_rgb(var(--c-danger))]',
          )}
        />
      ))}
    </div>
  );
}
