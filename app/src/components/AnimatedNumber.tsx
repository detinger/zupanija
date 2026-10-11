import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { fmtEurCompact } from "../lib/format";

const decimal = new Intl.NumberFormat("hr-HR", { maximumFractionDigits: 1 });

/** Animate the visible value while keeping the final value stable for assistive technology. */
export function AnimatedNumber({ value, format = "eur" }: {
  value: number;
  format?: "eur" | "percent";
}) {
  const element = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduced = useReducedMotion();
  const formatValue = (number: number) => format === "percent" ? `${decimal.format(number)} %` : fmtEurCompact(number);

  useEffect(() => {
    const from = previous.current;
    if (reduced || !element.current || from === value) {
      previous.current = value;
      return;
    }
    const animation = animate(from, value, {
      duration: .65,
      ease: [.22, 1, .36, 1],
      onUpdate: current => {
        previous.current = current;
        if (element.current) element.current.textContent = format === "percent" ? `${decimal.format(current)} %` : fmtEurCompact(current);
      },
    });
    return () => animation.stop();
  }, [value, format, reduced]);

  return <><span ref={element} aria-hidden="true">{formatValue(value)}</span><span className="sr-only">{formatValue(value)}</span></>;
}
