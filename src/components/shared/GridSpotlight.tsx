import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function GridSpotlight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useTheme();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const gridSize = 40;
    const spotlightRadius = 300;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = mode === "dark" ? "rgba(125, 160, 202, 0.08)" : "rgba(84, 131, 179, 0.06)";
      const highlightColor = mode === "dark" ? "rgba(193, 232, 255, 0.4)" : "rgba(84, 131, 179, 0.3)";

      // Draw grid
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          let opacity = 1;
          let size = 1;
          
          if (distance < spotlightRadius) {
            const factor = 1 - distance / spotlightRadius;
            opacity = 0.2 + factor * 0.8;
            size = 1 + factor * 2;
            ctx.strokeStyle = highlightColor.replace("0.4", String(opacity * 0.4));
          } else {
            ctx.strokeStyle = baseColor;
          }

          ctx.lineWidth = size;
          
          // Vertical line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + gridSize);
          ctx.stroke();
          
          // Horizontal line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + gridSize, y);
          ctx.stroke();

          // Dot at intersection
          if (distance < spotlightRadius) {
            const factor = 1 - distance / spotlightRadius;
            const dotSize = 1 + factor * 2;
            ctx.fillStyle = highlightColor.replace("0.4", String(factor * 0.6));
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Spotlight glow
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        spotlightRadius
      );
      const glowColor = mode === "dark" ? "84, 131, 179" : "125, 160, 202";
      gradient.addColorStop(0, `rgba(${glowColor}, 0.15)`);
      gradient.addColorStop(0.5, `rgba(${glowColor}, 0.05)`);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-50" />;
}
