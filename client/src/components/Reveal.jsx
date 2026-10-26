import { useEffect, useRef, useState } from "react";

// Fades/tilts children in when they scroll into view.
export default function Reveal({ as: Tag = "div", tilt = 0, delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setInView(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ "--tilt": `${tilt}deg`, "--tilt-from": `${tilt - 4}deg`, "--delay": `${delay}ms`, transform: `rotate(${tilt}deg)`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
