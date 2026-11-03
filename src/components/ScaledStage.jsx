import { useEffect, useState } from "react";

const W = 1920;
const H = 1080;
const fit = () => Math.min(window.innerWidth / W, window.innerHeight / H);

// Lays the dashboard out on a fixed 1920x1080 (16:9) canvas and scales it to fill the screen,
// so it never scrolls and looks identical on every projector or laptop.
export default function ScaledStage({ children }) {
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const on = () => setScale(fit());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return (
    <div className="desk-bg fixed inset-0 overflow-hidden">
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", width: W, height: H,
          marginLeft: -W / 2, marginTop: -H / 2, transform: `scale(${scale})`, transformOrigin: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
