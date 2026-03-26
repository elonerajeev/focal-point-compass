import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = mode === "dark" 
      ? ["rgba(84, 131, 179, 0.15)", "rgba(125, 160, 202, 0.12)", "rgba(193, 232, 255, 0.08)"]
      : ["rgba(84, 131, 179, 0.08)", "rgba(125, 160, 202, 0.06)", "rgba(193, 232, 255, 0.04)"];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.003;

      // Animated gradient blobs
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.3 + Math.sin(time + i * 2) * 0.2);
        const y = canvas.height * (0.3 + Math.cos(time * 0.8 + i * 2) * 0.2);
        const radius = Math.min(canvas.width, canvas.height) * (0.3 + Math.sin(time * 0.5 + i) * 0.1);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, colors[i]);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-60"
      style={{ filter: "blur(80px)" }}
    />
  );
}
