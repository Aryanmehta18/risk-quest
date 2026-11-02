import { useLayoutEffect } from "react";

/**
 * Auto-fits text inside a box so nothing scrolls or gets cut off.
 *
 * - boxRef:  the fixed-size area the text must fit inside (no padding on it)
 * - textRef: the element holding the text (gets font-size + columns set directly)
 * - deps:    values that change the text (e.g. the question). Re-fits when they change.
 *
 * It picks the largest font size (between min and max) that fits, trying 1 column and
 * 2 columns, and uses 2 columns only when that allows clearly bigger text.
 * It re-fits whenever the window or the box is resized, so no manual zooming is needed.
 */
export function useFitText(boxRef, textRef, deps, { min = 13, max = 56 } = {}) {
  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const fits = (size, cols) => {
      el.style.fontSize = `${size}px`;
      el.style.columnCount = String(cols);
      el.style.columnGap = cols > 1 ? "3rem" : "normal";
      return el.offsetHeight <= box.clientHeight + 1 && el.scrollWidth <= box.clientWidth + 1;
    };

    // binary search for the biggest size that fits
    const largest = (cols) => {
      let lo = min;
      let hi = max;
      let best = min;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (fits(mid, cols)) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return best;
    };

    const fit = () => {
      box.style.overflowY = "hidden"; // no scrollbar while measuring
      const one = largest(1);
      const two = largest(2);
      const cols = two > one * 1.12 ? 2 : 1;
      fits(cols === 2 ? two : one, cols);
      box.style.overflowY = ""; // back to the class (scrolls only if even the min size can't fit)
    };

    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, min, max]);
}