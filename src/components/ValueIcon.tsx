import type { ReactElement } from "react";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Svg = ({ children }: { children: React.ReactNode }) => <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="h-3.5 w-3.5 shrink-0" {...S}>{children}</svg>;

/** Small monoline glyphs for facet values (maturity, who acts, cost), so pills differ by shape as well as colour. */
const ICONS: Record<string, Record<string, () => ReactElement>> = {
  maturity: {
    "Speculative": () => <Svg><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.7.5-1 1.2-1 2.1h-5c0-.9-.3-1.6-1-2.1A6 6 0 0 1 12 3Z" /></Svg>,
    "Preclinical evidence": () => <Svg><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 15h9" /></Svg>,
    "Early clinical": () => <Svg><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></Svg>,
    "Being tested at scale": () => <Svg><circle cx="7" cy="8" r="2.5" /><circle cx="17" cy="8" r="2.5" /><circle cx="12" cy="15" r="2.5" /><path d="M2.5 20a4.5 4.5 0 0 1 9 0M12.5 20a4.5 4.5 0 0 1 9 0" /></Svg>,
  },
  actor: {
    Research: () => <Svg><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5 21 21" /></Svg>,
    Clinic: () => <Svg><path d="M3 21h18M5 21V8l7-4 7 4v13" /><path d="M12 11v6M9 14h6" /></Svg>,
    Industry: () => <Svg><path d="M4 21V5.5L12 3l8 2.5V21M4 21h16M9 21v-5h6v5" /></Svg>,
    Regulator: () => <Svg><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="M9 12l2 2 4-4" /></Svg>,
    Payer: () => <Svg><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 14h3" /></Svg>,
    Policy: () => <Svg><path d="M6 3h9l4 4v14H6V3Z" /><path d="M15 3v4h4M9 12h6M9 16h6" /></Svg>,
    Patients: () => <Svg><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20Z" /></Svg>,
    Data: () => <Svg><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></Svg>,
    Philanthropy: () => <Svg><path d="M12 21V11M7 11a5 5 0 0 1 5-5 5 5 0 0 1 5 5H7Z" /><path d="M4 21h16" /></Svg>,
    Engineering: () => <Svg><path d="M14.7 6.3a4 4 0 0 0 5 5L21 9.9V14l-7 7-7-7v-4.1l1.3 1.4a4 4 0 0 0 5-5L11 4l4 .1-.3 2.2Z" /></Svg>,
  },
  cost: {
    Small: () => <Svg><circle cx="12" cy="12" r="3" /></Svg>,
    Medium: () => <Svg><circle cx="8" cy="12" r="3" /><circle cx="16" cy="12" r="3" /></Svg>,
    Large: () => <Svg><circle cx="6" cy="12" r="3" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="3" /></Svg>,
  },
};

export function ValueIcon({ facet, value }: { facet: string; value: string }) {
  const I = ICONS[facet]?.[value];
  return I ? I() : null;
}
