import { useState } from "react";
import type { ReactNode } from "react";

type CollapsibleProps = {
  title: string;
  subtitle?: string;
  summary?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function Collapsible({
  title,
  subtitle,
  summary,
  defaultOpen = false,
  children
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  function toggle() {
    setIsOpen((value) => !value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  }

  return (
    <article className={`accordion ${isOpen ? "accordion--open" : ""}`}>
      <header
        className="accordion__trigger"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        <div className="accordion__title-group">
          <span className="accordion__heading">{title}</span>
          {subtitle ? <span className="accordion__subtitle">{subtitle}</span> : null}
        </div>
        <div className="accordion__trigger-right">
          {summary ? (
            <span className="accordion__summary">{summary}</span>
          ) : (
            <span className="accordion__expand">{isOpen ? "Hide" : "Add"}</span>
          )}
          <svg
            className="accordion__chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </header>

      <div className="accordion__content">{children}</div>
    </article>
  );
}
