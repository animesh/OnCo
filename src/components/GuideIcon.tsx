import type { GuideSectionId } from "@/lib/first-60-days";

/**
 * One monoline glyph per section of the first-60-days guide and the appointment sheet. Same grammar as
 * KindIcon and RouteIcon: 24x24 viewBox, 1.5px stroke, currentColor, rounded joins, no fills.
 */
const P: Record<GuideSectionId | "details" | "bring" | "answers" | "words" | "print", string> = {
  // Clipboard with a tick: what happens now
  now: "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM6 6h2m8 0h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1M9 13l2 2 4-4",
  // Three people: who is on your team
  team: "M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 20a5 5 0 0 1 10 0M2.5 19a3.5 3.5 0 0 1 4-3.4M21.5 19a3.5 3.5 0 0 0-4-3.4",
  // Signpost fork: decisions coming up
  decisions: "M12 21v-6M12 15c0-4 2-6 6-6h3M12 15c0-4-2-6-6-6H3M18 6l3 3-3 3M6 6 3 9l3 3",
  // Speech bubble with a question mark: questions to ask
  questions: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9ZM10 9a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5M12 14.2v.1",
  // Flask: trials to ask about
  trials: "M9 3v6l-4.5 8A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-3L15 9V3M8 3h8M7.5 14h9",
  // Open hand with a heart: help that costs nothing
  free: "M4 14v6M4 15h8.5a2 2 0 0 0 0-4H9M4 19h11l6-4a1.6 1.6 0 0 0-2-2.4L15 15M14 8.5c-2-2-1.5-4.5.5-4.5 1 0 1.5.7 1.5 1.2 0-.5.5-1.2 1.5-1.2 2 0 2.5 2.5.5 4.5L16 10.5 14 8.5Z",
  // Open book: what to read next
  read: "M12 6.5c-2-1.5-4.5-2-8-2v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2ZM12 6.5v13",
  // Id card: my details
  details: "M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM8.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 16a3 3 0 0 1 6 0M14 9h4M14 12.5h4M14 16h2.5",
  // Folder with papers: tests and results to bring
  bring: "M3 8a1.5 1.5 0 0 1 1.5-1.5H9l2 2h8.5A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V8ZM8 6.5V4.5h8v2M8 14h8",
  // Pen on lines: a place for the answers
  answers: "M4 20h16M4 16h7M4 12h5M13 15.5 19.5 9a1.8 1.8 0 0 0-2.5-2.5L10.5 13 10 16l3-.5Z",
  // Speech bubble with lines: the words I may hear
  words: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9ZM8 8.5h8M8 12h5",
  // Printer: print or save as PDF
  print: "M7 8V4h10v4M5 8h14a1.5 1.5 0 0 1 1.5 1.5v6H17v-3H7v3H3.5v-6A1.5 1.5 0 0 1 5 8ZM7 15.5h10V20H7z",
};

export type GuideIconId = keyof typeof P;

export function GuideIcon({ id, className = "h-5 w-5" }: { id: GuideIconId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[id]} />
    </svg>
  );
}
