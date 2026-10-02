"use client";
interface NumerologyCardProps { label: string; number: number; title: string; brief: string; keywords: string[]; delay?: number; }
export default function NumerologyCard({ label, number, title, brief, keywords }: NumerologyCardProps) {
  return <article className="number-card">
    <div className="number-label">{label}</div>
    <div className="number-value">{number}</div>
    <div className="number-detail"><h3 className="number-title">{title}</h3><p className="number-brief">{brief}</p><p className="number-keywords">{keywords.join(' · ')}</p></div>
  </article>;
}
