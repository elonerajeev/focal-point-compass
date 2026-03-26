import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const particleCount = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.fillStyle = mode === "dark" ? "rgba(17, 24, 39, 0.05)" : "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.z < 0) p.z = 1000;
        if (p.z > 1000) p.z = 0;

        // 3D projection
        const scale = 1000 / (1000 + p.z);
        const x2d = p.x * scale + canvas.width / 2 * (1 - scale);
        const y2d = p.y * scale + canvas.height / 2 * (1 - scale);
        const size = p.size * scale;

        // Draw particle
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
        const color = mode === "dark" ? "84, 131, 179" : "125, 160, 202";
        gradient.addColorStop(0, `rgba(${color}, ${p.opacity * scale})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach((p2, j) => {
          if (i >= j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            const scale2 = 1000 / (1000 + p2.z);
            const x2d2 = p2.x * scale2 + canvas.width / 2 * (1 - scale2);
            const y2d2 = p2.y * scale2 + canvas.height / 2 * (1 - scale2);

            ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 150) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(x2d2, y2d2);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-40" />;
}
