import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
const auraFields = [
  {
    className:
      "left-[-16rem] top-[-12rem] h-[28rem] w-[28rem] bg-[radial-gradient(circle,hsla(208,92%,76%,0.06),hsla(208,92%,76%,0.02)_38%,transparent_72%)]",
    duration: 22,
    delay: 0,
  },
  {
    className:
      "right-[-14rem] top-[8rem] h-[24rem] w-[24rem] bg-[radial-gradient(circle,hsla(213,54%,60%,0.04),hsla(213,54%,60%,0.015)_42%,transparent_72%)]",
    duration: 26,
    delay: 1.2,
  },
  {
    className:
      "left-[20%] bottom-[-14rem] h-[24rem] w-[24rem] bg-[radial-gradient(circle,hsla(173,58%,62%,0.035),hsla(173,58%,62%,0.01)_44%,transparent_74%)]",
    duration: 30,
    delay: 2.2,
  },
];

const floatingObjects = [
  {
    className: "left-[8%] top-[14%] h-24 w-48",
    rotation: -7,
    duration: 16,
    delay: 0.2,
    label: "Pulse",
  },
  {
    className: "right-[6%] top-[32%] h-20 w-44",
    rotation: 8,
    duration: 18,
    delay: 1,
    label: "Flow",
  },
  {
    className: "left-[46%] bottom-[10%] h-20 w-48",
    rotation: -5,
    duration: 20,
    delay: 1.8,
    label: "Signal",
  },
];

const particles = [
  { left: "18%", top: "20%", size: 3, delay: 0.4 },
  { left: "26%", top: "56%", size: 2, delay: 1.6 },
  { left: "74%", top: "22%", size: 3, delay: 0.8 },
  { left: "84%", top: "62%", size: 2, delay: 1.9 },
  { left: "44%", top: "80%", size: 3, delay: 2.2 },
];

export default function FloatingElements() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const pointerX = useMotionValue(0.52);
  const pointerY = useMotionValue(0.32);
  const cursorX = useSpring(pointerX, { stiffness: 85, damping: 24, mass: 0.6 });
  const cursorY = useSpring(pointerY, { stiffness: 85, damping: 24, mass: 0.6 });
  const driftY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const driftX = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const monolithY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const monolithRotate = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const ringY = useTransform(driftY, (value) => value * 0.45);
  const dashedRingY = useTransform(driftY, (value) => value * 0.28);

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;

    pointerX.set(window.innerWidth * 0.54);
    pointerY.set(window.innerHeight * 0.34);

    const handleMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--info)_/_0.04),transparent_22%),radial-gradient(circle_at_82%_12%,hsl(var(--accent)_/_0.03),transparent_20%),radial-gradient(circle_at_50%_112%,hsl(var(--primary)_/_0.025),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)_/_0.01),transparent_24%,transparent_72%,hsl(var(--accent)_/_0.01))]" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border) / 0.16) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.16) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage: "radial-gradient(circle at center, black 18%, rgba(0,0,0,0.74) 50%, transparent 84%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.62'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {auraFields.map((field, index) => (
        <motion.div
          key={`aura-${index}`}
          className={`absolute rounded-full blur-3xl mix-blend-screen ${field.className}`}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 30, -18, 0],
                  y: [0, -24, 18, 0],
                  scale: [1, 1.11, 0.97, 1],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: field.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: field.delay,
                }
          }
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-[28%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2"
        style={{ y: monolithY, rotate: monolithRotate }}
      >
        <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_30%_22%,hsla(208,92%,76%,0.06),transparent_30%),radial-gradient(circle_at_78%_82%,hsla(173,58%,62%,0.04),transparent_34%),linear-gradient(180deg,hsl(var(--card)_/_0.08),hsl(var(--card)_/_0.02))] shadow-[0_18px_40px_hsl(222_42%_8%_/_0.08)] backdrop-blur-2xl" />
        <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/4" />
        <div className="absolute inset-4 rounded-[2.3rem] border border-white/4 bg-[linear-gradient(135deg,hsl(var(--background)_/_0.04),transparent_42%,hsl(var(--foreground)_/_0.01))]" />
        <div className="absolute inset-8 rounded-[1.8rem] border border-white/3 bg-[radial-gradient(circle_at_50%_22%,hsla(212,90%,74%,0.03),transparent_36%),radial-gradient(circle_at_50%_78%,hsla(173,58%,62%,0.03),transparent_38%)]" />
        <div className="absolute left-8 right-8 top-14 h-px bg-[linear-gradient(90deg,transparent,hsla(212,92%,72%,0.10),transparent)]" />
        <div className="absolute left-10 right-10 bottom-14 h-px bg-[linear-gradient(90deg,transparent,hsla(173,58%,62%,0.08),transparent)]" />

        <div className="absolute inset-y-8 left-8 w-px bg-[linear-gradient(180deg,transparent,hsla(212,92%,72%,0.06),transparent)]" />
        <div className="absolute inset-y-8 right-8 w-px bg-[linear-gradient(180deg,transparent,hsla(173,58%,62%,0.05),transparent)]" />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[10rem] w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsla(208,92%,76%,0.07),hsla(208,92%,76%,0.03)_36%,transparent_70%)] blur-2xl mix-blend-screen"
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 12, -8, 0], scale: [1, 1.02, 0.995, 1], opacity: [0.16, 0.26, 0.18, 0.16] }
          }
          transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[8rem] w-[8rem] rounded-full border border-white/6 bg-[radial-gradient(circle_at_35%_30%,hsla(212,90%,82%,0.14),hsla(212,90%,72%,0.04)_34%,hsla(222,42%,8%,0.03)_72%)] shadow-[0_12px_30px_hsl(222_42%_8%_/_0.08)] backdrop-blur-2xl">
            <motion.div
              className="absolute inset-0 rounded-full border border-white/5"
              animate={reduceMotion ? undefined : { scale: [1, 1.03, 1], opacity: [0.10, 0.04, 0.10] }}
              transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-[14%] rounded-full border border-white/5 bg-[linear-gradient(180deg,hsl(var(--card)_/_0.08),hsl(var(--card)_/_0.03))] backdrop-blur-xl"
              animate={reduceMotion ? undefined : { rotate: [0, -8, 4, 0] }}
              transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-[24%] rounded-full bg-[radial-gradient(circle,hsla(173,58%,62%,0.08),transparent_60%)] blur-xl" />
            <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,hsla(212,92%,76%,0.08),transparent_62%)] blur-2xl" />
          </div>
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3"
          style={{ y: ringY }}
          animate={reduceMotion ? undefined : { rotate: [0, 360] }}
          transition={reduceMotion ? undefined : { duration: 36, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3 border-dashed opacity-15"
          style={{ x: driftX, y: dashedRingY }}
          animate={reduceMotion ? undefined : { rotate: [360, 0] }}
          transition={reduceMotion ? undefined : { duration: 52, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {!reduceMotion && (
        <motion.div
          className="absolute left-0 top-0 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsla(212,90%,72%,0.03),transparent_58%)] blur-3xl mix-blend-screen"
          style={{ x: cursorX, y: cursorY }}
        />
      )}

      <motion.div
        className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,hsl(var(--card)_/_0.06),transparent)] opacity-35"
        animate={reduceMotion ? undefined : { opacity: [0.08, 0.16, 0.1] }}
        transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-[18%] mx-auto h-px w-[72%] bg-[linear-gradient(90deg,transparent,hsla(212,92%,72%,0.08),hsla(173,58%,62%,0.06),transparent)] blur-[0.5px]"
        animate={reduceMotion ? undefined : { opacity: [0.08, 0.16, 0.1] }}
        transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,hsl(var(--background)_/_0.16)_100%)]" />
    </div>
  );
}
