"use client";
import { useRef, useState } from "react";
import { Clock } from "lucide-react";
import styles from "./TimePickerInput.module.scss";

interface TimePickerInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

type Mode = "hour" | "minute";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const to24h = (h: number, m: number, p: "AM" | "PM") => {
    let h24 = h;
    if (p === "AM" && h === 12) h24 = 0;
    else if (p === "PM" && h !== 12) h24 = h + 12;
    return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const parseValue = (val: string) => {
    if (!val) return { h: 12, m: 0, p: "AM" as const };
    const [h24, m] = val.split(":").map(Number);
    return {
        h: h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24,
        m,
        p: (h24 >= 12 ? "PM" : "AM") as "AM" | "PM",
    };
};

const TimePickerInput = ({ label, value, onChange, required }: TimePickerInputProps) => {
    const parsed = parseValue(value);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("hour");
    const [hour, setHour] = useState(parsed.h);
    const [minute, setMinute] = useState(parsed.m);
    const [period, setPeriod] = useState(parsed.p);
    const ref = useRef<HTMLDivElement>(null);

    const close = () => {
        setOpen(false);
        setMode("hour");
    };

    const selectHour = (h: number) => {
        setHour(h);
        onChange(to24h(h, minute, period));
        setMode("minute");
    };

    const selectMinute = (m: number) => {
        setMinute(m);
        onChange(to24h(hour, m, period));
        setOpen(false);
        setMode("hour");
    };

    const togglePeriod = (p: "AM" | "PM") => {
        setPeriod(p);
        onChange(to24h(hour, minute, p));
    };

    const items = mode === "hour" ? HOURS : MINUTES;
    const selected = mode === "hour" ? hour : minute;
    const radius = 72;

    const getPos = (i: number) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return {
            left: `calc(50% + ${Math.cos(a) * radius}px)`,
            top: `calc(50% + ${Math.sin(a) * radius}px)`,
        };
    };

    const pointerAngle = mode === "hour"
        ? HOURS.indexOf(hour) * 30
        : MINUTES.indexOf(minute) * 30;

    const display = value
        ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`
        : "--:-- --";

    return (
        <div className={styles.wrapper} ref={ref}>
            <label className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>
            <button
                type="button"
                className={`${styles.trigger} ${open ? styles.active : ""}`}
                onClick={() => setOpen(!open)}
            >
                <span className={value ? styles.valueText : styles.placeholder}>{display}</span>
                <Clock size={15} className={styles.icon} />
            </button>

            {open && (
                <>
                <button
                    type="button"
                    aria-label="إغلاق منتقي الوقت"
                    onClick={close}
                    style={{ position: "fixed", inset: 0, zIndex: 90, background: "transparent", border: 0 }}
                />
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <div className={styles.timeDisplay}>
                            <button
                                type="button"
                                className={mode === "hour" ? styles.activeSegment : styles.segment}
                                onClick={() => setMode("hour")}
                            >
                                {String(hour).padStart(2, "0")}
                            </button>
                            <span className={styles.colon}>:</span>
                            <button
                                type="button"
                                className={mode === "minute" ? styles.activeSegment : styles.segment}
                                onClick={() => setMode("minute")}
                            >
                                {String(minute).padStart(2, "0")}
                            </button>
                        </div>
                        <div className={styles.periodToggle}>
                            <button
                                type="button"
                                className={`${styles.periodBtn} ${period === "AM" ? styles.periodActive : ""}`}
                                onClick={() => togglePeriod("AM")}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                className={`${styles.periodBtn} ${period === "PM" ? styles.periodActive : ""}`}
                                onClick={() => togglePeriod("PM")}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    <div className={styles.clockFace}>
                        <div className={styles.centerDot} />
                        <div
                            className={styles.pointer}
                            style={{ transform: `rotate(${pointerAngle}deg)` }}
                        />
                        {items.map((item, i) => (
                            <button
                                key={item}
                                type="button"
                                className={`${styles.clockNum} ${item === selected ? styles.numSelected : ""}`}
                                style={getPos(i)}
                                onClick={() => (mode === "hour" ? selectHour(item) : selectMinute(item))}
                            >
                                {mode === "minute" ? String(item).padStart(2, "0") : item}
                            </button>
                        ))}
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default TimePickerInput;