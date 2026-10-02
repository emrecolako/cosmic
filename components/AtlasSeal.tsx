/** Decorative brand mark. Never used to represent calculated chart data. */
export default function AtlasSeal({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 520 520" fill="none" aria-hidden="true">
    <circle cx="260" cy="260" r="238" stroke="currentColor" opacity=".3" />
    <circle cx="260" cy="260" r="216" stroke="currentColor" opacity=".55" />
    {Array.from({ length: 120 }, (_, i) => <line key={i} x1="260" y1={i % 5 === 0 ? 24 : 29} x2="260" y2="35" transform={`rotate(${i * 3} 260 260)`} stroke="currentColor" opacity={i % 5 === 0 ? .7 : .3} />)}
    <circle cx="260" cy="260" r="164" stroke="currentColor" opacity=".22" />
    <ellipse cx="260" cy="260" rx="90" ry="207" transform="rotate(38 260 260)" stroke="currentColor" opacity=".65" />
    <ellipse cx="260" cy="260" rx="90" ry="207" transform="rotate(-38 260 260)" stroke="currentColor" opacity=".65" />
    <ellipse cx="260" cy="260" rx="205" ry="65" stroke="currentColor" opacity=".3" />
    <path d="M260 228V292M228 260H292" stroke="currentColor" />
    <circle cx="260" cy="260" r="7" fill="var(--text)" />
    <circle cx="134" cy="109" r="4" fill="var(--text)" />
    <circle cx="416" cy="319" r="4" fill="currentColor" />
    <circle cx="122" cy="371" r="3" fill="currentColor" />
  </svg>;
}
