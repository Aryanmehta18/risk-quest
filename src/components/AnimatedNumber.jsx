import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export default function AnimatedNumber({ value, className }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}