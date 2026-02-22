"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroSection.module.scss";
import { Button } from "@/presentation/components";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/presentation/constants";

type Shape = {
  xRatio: number;
  targetLength: number;
  size: number;
  color: string;
  type: "crescent" | "lantern" | "star";
  swayAngle: number;
  swaySpeed: number;
  swayRange: number;
  x: number;
  y: number;
};

const FIXED_SHAPES: Omit<Shape, "x" | "y" | "swayAngle">[] = [
  { xRatio: 0.04, targetLength: 180, size: 16, color: "#16a34a", type: "lantern", swaySpeed: 0.005, swayRange: 8 },
  { xRatio: 0.12, targetLength: 140, size: 16, color: "#22c55e", type: "star", swaySpeed: -0.004, swayRange: 6 },
  { xRatio: 0.20, targetLength: 220, size: 20, color: "#15803d", type: "crescent", swaySpeed: 0.003, swayRange: 10 },
  { xRatio: 0.28, targetLength: 160, size: 18, color: "#4ade80", type: "star", swaySpeed: -0.006, swayRange: 7 },
  { xRatio: 0.36, targetLength: 250, size: 18, color: "#16a34a", type: "lantern", swaySpeed: 0.004, swayRange: 9 },
  { xRatio: 0.44, targetLength: 130, size: 15, color: "#86efac", type: "star", swaySpeed: -0.005, swayRange: 5 },
  { xRatio: 0.50, targetLength: 200, size: 21, color: "#15803d", type: "crescent", swaySpeed: 0.006, swayRange: 11 },
  { xRatio: 0.57, targetLength: 170, size: 19, color: "#22c55e", type: "star", swaySpeed: -0.003, swayRange: 6 },
  { xRatio: 0.64, targetLength: 240, size: 14, color: "#16a34a", type: "lantern", swaySpeed: 0.005, swayRange: 9 },
  { xRatio: 0.72, targetLength: 150, size: 17, color: "#4ade80", type: "star", swaySpeed: -0.004, swayRange: 7 },
  { xRatio: 0.79, targetLength: 210, size: 22, color: "#15803d", type: "crescent", swaySpeed: 0.003, swayRange: 10 },
  { xRatio: 0.87, targetLength: 145, size: 16, color: "#86efac", type: "star", swaySpeed: -0.005, swayRange: 5 },
  { xRatio: 0.94, targetLength: 230, size: 22, color: "#16a34a", type: "lantern", swaySpeed: 0.004, swayRange: 8 },
  { xRatio: 0.08, targetLength: 300, size: 20, color: "#22c55e", type: "crescent", swaySpeed: -0.003, swayRange: 12 },
  { xRatio: 0.97, targetLength: 280, size: 18, color: "#15803d", type: "crescent", swaySpeed: 0.004, swayRange: 9 },
];

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);

  const scrollToOpportunities = () => {
    document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      shapesRef.current = FIXED_SHAPES.map((s) => ({
        ...s,
        x: s.xRatio * canvas.width,
        y: -100,
        swayAngle: 0,
      }));
    };
    window.addEventListener("resize", resize);
    resize();

    const drawCrescent = (c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      c.save();
      c.translate(x, y);
      c.rotate(-0.2);
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.8, -size, size * 0.8, size, 0, size);
      c.bezierCurveTo(size * 0.4, size, size * 0.4, -size, 0, -size);
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawLantern = (c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      c.save();
      c.translate(x, y);

      const r = size * 0.9;
      const sides = 6;
      const hexTop = -r * 1.2;
      const hexBot = r * 1.2;

      c.strokeStyle = color;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -r * 2.2);
      c.lineTo(0, -r * 1.5);
      c.stroke();

      c.strokeStyle = color;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, -r * 1.5, r * 0.18, 0, Math.PI * 2);
      c.stroke();

      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r * 0.45;
        const py = Math.sin(a) * r * 0.3 - r * 1.5;
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.fill();

      c.strokeStyle = color;
      c.lineWidth = 1.8;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r;
        c.beginPath();
        c.moveTo(px * 0.7, hexTop);
        c.lineTo(px, hexTop + (hexBot - hexTop) * 0.15);
        c.lineTo(px, hexBot - (hexBot - hexTop) * 0.15);
        c.lineTo(px * 0.7, hexBot);
        c.stroke();
      }

      for (let i = 0; i < sides; i++) {
        const a1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;
        const gg = c.createLinearGradient(Math.cos((a1 + a2) / 2) * r * 0.5, hexTop, Math.cos((a1 + a2) / 2) * r * 0.5, hexBot);
        gg.addColorStop(0, `${color}10`);
        gg.addColorStop(0.5, `${color}28`);
        gg.addColorStop(1, `${color}10`);
        c.fillStyle = gg;
        c.beginPath();
        c.moveTo(Math.cos(a1) * r * 0.68, hexTop + 4);
        c.lineTo(Math.cos(a1) * r, hexTop + (hexBot - hexTop) * 0.14);
        c.lineTo(Math.cos(a1) * r, hexBot - (hexBot - hexTop) * 0.14);
        c.lineTo(Math.cos(a1) * r * 0.68, hexBot - 4);
        c.lineTo(Math.cos(a2) * r * 0.68, hexBot - 4);
        c.lineTo(Math.cos(a2) * r, hexBot - (hexBot - hexTop) * 0.14);
        c.lineTo(Math.cos(a2) * r, hexTop + (hexBot - hexTop) * 0.14);
        c.lineTo(Math.cos(a2) * r * 0.68, hexTop + 4);
        c.closePath();
        c.fill();
      }

      for (const ry of [hexTop, hexBot]) {
        c.strokeStyle = color;
        c.lineWidth = 1.8;
        c.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
          i === 0 ? c.moveTo(Math.cos(a) * r * 0.7, ry) : c.lineTo(Math.cos(a) * r * 0.7, ry);
        }
        c.stroke();
      }

      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r * 0.45;
        const py = Math.sin(a) * r * 0.3 + r * 1.5;
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.fill();

      const glo = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
      glo.addColorStop(0, `${color}22`);
      glo.addColorStop(1, "transparent");
      c.fillStyle = glo;
      c.beginPath();
      c.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      c.save();
      c.translate(x, y);
      const glo = c.createRadialGradient(0, 0, 0, 0, 0, size * 2);
      glo.addColorStop(0, `${color}30`);
      glo.addColorStop(1, "transparent");
      c.fillStyle = glo;
      c.beginPath();
      c.arc(0, 0, size * 2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 72 - 90) * (Math.PI / 180);
        const innerA = outerA + 36 * (Math.PI / 180);
        i === 0
          ? c.moveTo(Math.cos(outerA) * size, Math.sin(outerA) * size)
          : c.lineTo(Math.cos(outerA) * size, Math.sin(outerA) * size);
        c.lineTo(Math.cos(innerA) * size * 0.42, Math.sin(innerA) * size * 0.42);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapesRef.current.forEach((s) => {
        s.y += (s.targetLength - s.y) * 0.018;
        s.swayAngle += s.swaySpeed;
        s.x = s.xRatio * canvas.width + Math.sin(s.swayAngle) * s.swayRange;

        ctx.beginPath();
        ctx.moveTo(s.xRatio * canvas.width, 0);
        ctx.lineTo(s.x, s.y - s.size * 1.2);
        ctx.strokeStyle = "rgba(22,163,74,0.15)";
        ctx.lineWidth = 0.9;
        ctx.stroke();

        if (s.type === "crescent") drawCrescent(ctx, s.x, s.y, s.size, s.color);
        else if (s.type === "lantern") drawLantern(ctx, s.x, s.y, s.size, s.color);
        else drawStar(ctx, s.x, s.y, s.size * 0.85, s.color);
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <section className={styles.hero}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>
        <div className={styles.badge}>
          <HeartHandshake size={16} />
          رمضان كريم: شهر التطوع والعطاء
        </div>
        <h1 className={styles.title}>
          <span className={styles.line}>
            <span className={styles.word}>اجعل</span>
            <span className={styles.word}>من</span>
            <span className={styles.word}>رمضانك</span>
            <span className={styles.word}>أثراً</span>
          </span>
          <span className={styles.highlight}>لحياة الآخرين</span>
        </h1>
        <p className={styles.subtitle}>
          بادر بالتطوع في هذا الشهر الفضيل وكن سبباً في سعادة من حولك. خطواتك البسيطة تصنع تغييراً كبيراً.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={scrollToOpportunities} icon={<ArrowLeft size={18} />}>
            استكشف فرص التطوع
          </Button>
          <Link href={ROUTES.ABOUT} className={styles.linkBtn}>
            تعرّف علينا أكثر
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;