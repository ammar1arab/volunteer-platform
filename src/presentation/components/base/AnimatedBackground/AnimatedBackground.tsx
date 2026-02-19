"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./AnimatedBackground.module.scss";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  layer: number;
};

const PARTICLE_LAYERS = [
  { count: 40, speed: 0.15, color: [76, 175, 80], radius: [1.2, 2] },     // Layer 1 (front)
  { count: 35, speed: 0.25, color: [56, 142, 60], radius: [0.9, 1.5] },   // Layer 2 (middle)
  { count: 30, speed: 0.35, color: [104, 159, 56], radius: [0.6, 1.2] },  // Layer 3 (back)
];

const MAX_DISTANCE = 150;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 0.03;

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    
    PARTICLE_LAYERS.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * layer.speed,
          vy: (Math.random() - 0.5) * layer.speed,
          radius: Math.random() * (layer.radius[1] - layer.radius[0]) + layer.radius[0],
          opacity: Math.random() * 0.4 + 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
          layer: layerIndex,
        });
      }
    });
    
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    resize();

    const animate = () => {
      timeRef.current += 0.016;
      
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update particles
      particles.forEach((particle) => {
        // Mouse repulsion
        if (mouse.active) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            particle.vx += (dx / dist) * force;
            particle.vy += (dy / dist) * force;
          }
        }

        // Apply velocity with slight damping
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundary bounce with padding
        const padding = 50;
        if (particle.x < -padding) particle.x = window.innerWidth + padding;
        if (particle.x > window.innerWidth + padding) particle.x = -padding;
        if (particle.y < -padding) particle.y = window.innerHeight + padding;
        if (particle.y > window.innerHeight + padding) particle.y = -padding;
      });

      // Draw connections (from back to front)
      for (let layerIdx = PARTICLE_LAYERS.length - 1; layerIdx >= 0; layerIdx--) {
        const layerParticles = particles.filter(p => p.layer === layerIdx);
        const layer = PARTICLE_LAYERS[layerIdx];
        
        ctx.lineWidth = 0.5 + (layerIdx * 0.2);
        
        for (let i = 0; i < layerParticles.length; i++) {
          for (let j = i + 1; j < layerParticles.length; j++) {
            const p1 = layerParticles[i];
            const p2 = layerParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MAX_DISTANCE) {
              const alpha = ((1 - dist / MAX_DISTANCE) * 0.15) * (p1.opacity + p2.opacity) / 2;
              const [r, g, b] = layer.color;
              
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles with glow (from back to front)
      particles.forEach((particle) => {
        const layer = PARTICLE_LAYERS[particle.layer];
        const [r, g, b] = layer.color;
        
        // Pulsing effect
        const pulse = Math.sin(timeRef.current * 2 + particle.pulsePhase) * 0.15 + 0.85;
        const currentRadius = particle.radius * pulse;
        const currentOpacity = particle.opacity * pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentRadius * 3
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.15})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse ripple effect
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS
        );
        gradient.addColorStop(0, "rgba(76, 175, 80, 0.08)");
        gradient.addColorStop(0.5, "rgba(76, 175, 80, 0.03)");
        gradient.addColorStop(1, "rgba(76, 175, 80, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, [initParticles]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default AnimatedBackground;