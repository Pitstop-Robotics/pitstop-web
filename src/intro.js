// Load intro: ink square pops in, "pı" appears inside it, the dot drops in from above,
// then square and mark slide left together while the remaining letters emerge from behind
// the square, and the square fades out leaving the plain wordmark.
//
// Markup contract (any element can be the root):
//   [data-intro]          overlay, removed when the intro ends
//   [data-intro-box]      the square, centered on its parent (the word)
//   [data-intro-mark]     the letters that start inside the square
//   [data-intro-dot]      the i-dot that drops in
//   [data-intro-letter]   letters that emerge from the square, in order
//   [data-intro-sub]      optional descriptor under the word

const EASE = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  in: "cubic-bezier(0.55, 0, 1, 0.45)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  pop: "cubic-bezier(0.34, 1.45, 0.64, 1)",
  fall: "cubic-bezier(0.5, 0, 0.9, 0.55)",
};

// [start, duration] in ms
export const INTRO_TIMELINE = {
  boxIn: [200, 500],
  markIn: [550, 400],
  dotDrop: [850, 620],
  slide: [1650, 750],
  letters: [2000, 700],
  letterStagger: 50,
  boxOut: [2350, 450],
  subIn: [2650, 600],
  subOut: [3200, 300],
  dock: [3350, 950],
  bgOut: [3450, 750],
};

const SKIP_RATE = 5;

// `dockTarget`: element the word travels into at the end (the nav wordmark). Without one,
// the word fades in place.
// `sound`: optional promise of { play(timeline, speed), stop(), close() } (see intro-sound.js).
export async function playIntro(
  root,
  { timeline = INTRO_TIMELINE, speed = 1, skippable = true, dockTarget = null, sound = null } = {}
) {
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof root.animate !== "function") return root.remove();

  const animations = [];
  let cues = null;
  const skip = () => {
    animations.forEach((a) => a.updatePlaybackRate(SKIP_RATE));
    cues?.stop();
    cues = null;
  };

  try {
    [, cues] = await Promise.all([document.fonts?.ready, typeof sound === "function" ? sound().catch(() => null) : null]);

    const box = root.querySelector("[data-intro-box]");
    const mark = root.querySelector("[data-intro-mark]");
    const dot = root.querySelector("[data-intro-dot]");
    const sub = root.querySelector("[data-intro-sub]");
    const letters = [...root.querySelectorAll("[data-intro-letter]")];
    const word = mark.parentElement;

    const css = getComputedStyle(root);
    const ink = css.getPropertyValue("--ink").trim();
    const bg = css.getPropertyValue("--bg").trim();
    const accent = css.getPropertyValue("--accent").trim();
    const dotStart = getComputedStyle(dot).backgroundColor;

    const centerX = (el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    const boxX = centerX(box);
    const markX = centerX(mark);
    const markDx = boxX - markX;
    // Letters start tucked behind the square's right edge (its final position).
    const boxRight = markX + box.getBoundingClientRect().width / 2;
    const letterDx = letters.map((letter) => {
      const r = letter.getBoundingClientRect();
      return Math.min(0, boxRight - r.right);
    });

    // "both" holds the first frame during the delay; later passes on an already-animated
    // property must use "forwards" so they don't override the earlier pass while waiting.
    const play = (el, frames, [start, duration], easing, { fill = "both", offset = 0 } = {}) => {
      animations.push(
        el.animate(frames, { delay: (start + offset) / speed, duration: duration / speed, easing, fill })
      );
    };

    // A smooth light-to-ink crossfade would pass through grey-on-grey, so the text flips
    // quickly at the fade's midpoint, where both colors still contrast with the half-faded square.
    const flip = (prop, from, to) => [
      { offset: 0, [prop]: from },
      { offset: 0.42, [prop]: from },
      { offset: 0.58, [prop]: to },
      { offset: 1, [prop]: to },
    ];

    cues?.play(timeline, speed);
    play(box, [{ scale: "0.3", opacity: 0 }, { scale: "1", opacity: 1 }], timeline.boxIn, EASE.pop);
    play(box, [{ translate: "0 0" }, { translate: `${-markDx}px 0` }], timeline.slide, EASE.inOut);
    play(box, [{ opacity: 1 }, { opacity: 0 }], timeline.boxOut, "linear", { fill: "forwards" });

    play(mark, [{ opacity: 0, translate: "0 0.12em" }, { opacity: 1, translate: "0 0" }], timeline.markIn, EASE.out);
    play(mark, [{ transform: `translateX(${markDx}px)` }, { transform: "none" }], timeline.slide, EASE.inOut);
    play(mark, flip("color", bg, ink), timeline.boxOut, "linear");

    play(
      dot,
      [
        { offset: 0, opacity: 0, transform: "translateY(-3em) scale(0.85, 1.2)", easing: EASE.fall },
        { offset: 0.7, opacity: 1, transform: "translateY(0) scale(1.3, 0.7)", easing: EASE.out },
        { offset: 1, opacity: 1, transform: "none" },
      ],
      timeline.dotDrop,
      "linear"
    );
    play(dot, flip("backgroundColor", dotStart, accent), timeline.boxOut, "linear");

    // Farthest letter leaves first so letters never cross each other.
    letters.forEach((letter, i) => {
      play(
        letter,
        [
          { offset: 0, opacity: 0, transform: `translateX(${letterDx[i]}px)` },
          { offset: 0.25, opacity: 1 },
          { offset: 1, opacity: 1, transform: "none" },
        ],
        timeline.letters,
        EASE.out,
        { offset: (letters.length - 1 - i) * timeline.letterStagger }
      );
    });
    if (sub) {
      play(
        sub,
        [
          { opacity: 0, letterSpacing: "0.6em", paddingLeft: "0.6em", translate: "0 6px" },
          { opacity: 1, letterSpacing: "0.32em", paddingLeft: "0.32em", translate: "0 0" },
        ],
        timeline.subIn,
        EASE.out
      );
    }

    // The word's layout box is already the final wordmark (children animate with transforms),
    // so measuring now gives the exact travel to the nav wordmark.
    const from = word.getBoundingClientRect();
    const to = dockTarget?.getBoundingClientRect();
    const dock = to?.width
      ? `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${
          to.top + to.height / 2 - (from.top + from.height / 2)
        }px) scale(${to.width / from.width})`
      : "translateY(-10px)";

    if (sub) play(sub, [{ opacity: 1 }, { opacity: 0 }], timeline.subOut, "linear", { fill: "forwards" });
    play(
      word,
      [
        { offset: 0, transform: "none", opacity: 1 },
        { offset: 0.75, opacity: 1 },
        { offset: 1, transform: dock, opacity: 0 },
      ],
      timeline.dock,
      EASE.inOut,
      { fill: "forwards" }
    );
    play(root, [{ backgroundColor: getComputedStyle(root).backgroundColor }, { backgroundColor: "transparent" }], timeline.bgOut, EASE.inOut, {
      fill: "forwards",
    });

    if (skippable) {
      root.addEventListener("pointerdown", skip, { once: true });
      window.addEventListener("keydown", skip, { once: true });
    }

    await Promise.all(animations.map((a) => a.finished));
  } finally {
    window.removeEventListener("keydown", skip);
    cues?.close();
    root.remove();
  }
}
