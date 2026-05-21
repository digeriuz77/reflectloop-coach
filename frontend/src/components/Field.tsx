import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {hint ? <span className="field__hint">{hint}</span> : null}
      {children}
    </label>
  );
}
