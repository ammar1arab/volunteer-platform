"use client";
import { useEffect, useState } from "react";
import styles from "./IntroPage.module.scss";

const CITIES = [
  { x: 100, y: 68,  name: "إربد" },
  { x: 138, y: 78,  name: "المفرق" },
  { x: 78,  y: 86,  name: "عجلون" },
  { x: 110, y: 98,  name: "جرش" },
  { x: 146, y: 115, name: "الزرقاء" },
  { x: 98,  y: 128, name: "عمان" },
  { x: 70,  y: 122, name: "البلقاء" },
  { x: 88,  y: 152, name: "مادبا" },
  { x: 108, y: 178, name: "الكرك" },
  { x: 82,  y: 198, name: "الطفيلة" },
  { x: 128, y: 220, name: "معان" },
  { x: 98,  y: 248, name: "العقبة" },
];

const CONNECT_LINE =
  "M 100,68 L 138,78 L 110,98 L 146,115 L 98,128 L 70,122 L 88,152 L 108,178 L 82,198 L 128,220 L 98,248";

const FP_PATHS = [
  "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",
  "M14 13.12c0 2.38 0 6.38-1 8.88",
  "M17.29 21.02c.12-.6.43-2.3.5-3.02",
  "M2 12a10 10 0 0 1 18-6",
  "M2 17h2a10 10 0 0 0 9-5",
  "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",
  "M8.65 22c.21-.66.45-1.32.57-2",
  "M9 6.8a6 6 0 0 1 9 5.2v2",
];

export default function IntroPage({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(false);
  const [exit, setExit]     = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), 100);
    const t2 = setTimeout(() => setExit(true), 2600);
    const t3 = setTimeout(onDone, 3150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`${styles.wrapper} ${exit ? styles.fadeOut : ""}`}>
      <div className={styles.container}>
        <svg viewBox="0 0 200 270" className={styles.svg}>
          <g transform="translate(4, 39) scale(8)" className={styles.fingerprintGroup}>
            {FP_PATHS.map((d, i) => (
              <path key={i} d={d} style={{ animationDelay: `${i * 0.06}s` }} />
            ))}
          </g>

          {active && <path d={CONNECT_LINE} className={styles.trace} />}

          {active && CITIES.map((city, i) => (
            <g
              key={i}
              className={styles.city}
              style={{ animationDelay: `${0.5 + i * 0.07}s` }}
            >
              <circle cx={city.x} cy={city.y} r="2" className={styles.dot} />
              <text x={city.x + 5} y={city.y + 3} className={styles.cityName}>
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}