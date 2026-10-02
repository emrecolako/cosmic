/** Artwork and proportions from the approved Fortune design in Paper. */
export default function FortuneCards({ labels, number = 7, interactive = false }: { labels: [string, string, string]; number?: number; interactive?: boolean }) {
  const targets = ['numbers', 'star-map', 'eastern-mirror'];
  return <div className="fortune-cards">{labels.map((label, index) => {
    const art = <><div className="fortune-card-frame"><svg viewBox="0 0 102 126" aria-hidden="true" focusable="false">
      {index === 0 ? <><rect width="102" height="126" fill="#34334E"/><circle cx="51" cy="61" r="35" fill="none" stroke="#D9BF8C" strokeWidth=".7"/><circle cx="51" cy="61" r="44" fill="none" stroke="#D9BF8C" strokeWidth=".4"/><path d="M51 5v112M6 61h90M19 29l64 64M19 93l64-64" fill="none" stroke="#D9BF8C" strokeWidth=".5"/><circle cx="51" cy="61" r="24" fill="#D9BF8C"/><text x="51" y="76" textAnchor="middle" fill="#34334E" className="fortune-number">{number}</text></> : index === 1 ? <><rect width="102" height="126" fill="#E0E5DC"/>{Array.from({length:12}, (_, i) => <path key={i} d={`M${i*10-8} -10 C${i*10+20} 20 ${i*10-20} 40 ${i*10} 63 S${i*10+18} 102 ${i*10} 136`} fill="none" stroke="#414F52" strokeWidth="4"/>)}</> : <><rect width="102" height="126" fill="#141E1D"/><circle cx="51" cy="63" r="34" fill="#D8D8C1"/><circle cx="67" cy="51" r="32" fill="#141E1D"/><path d="M17 103h68M26 111h50" stroke="#D8D8C1" strokeWidth=".5"/><path d="m75 22 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#D8D8C1"/></>}
    </svg><span className="fortune-caption">{label}</span></div>{interactive && <span className="fortune-info" aria-hidden="true">↗</span>}</>;
    return interactive ? <a key={index} href={`#${targets[index]}`} className="fortune-card">{art}</a> : <div key={index} className="fortune-card">{art}</div>;
  })}</div>;
}
