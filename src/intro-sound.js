// Synthesized sound cues for the load intro (Web Audio, no files).
// Browsers keep audio locked until the visitor interacts with the page, so on most first
// visits this stays silent. Cues are only scheduled if the audio clock is already running;
// a context that unlocks later would otherwise play every cue at once, out of sync.

const MASTER_GAIN = 0.5;
const UNLOCK_WAIT_MS = 120;

export async function createIntroSound() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  if (ctx.state !== "running") {
    await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, UNLOCK_WAIT_MS))]);
  }
  if (ctx.state !== "running") {
    ctx.close();
    return null;
  }

  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

  const envelope = (t, peak, attack, decay) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(master);
    return g;
  };

  const tone = (t, { type = "sine", from, to = from, peak, attack = 0.005, decay }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
    osc.connect(envelope(t, peak, attack, decay));
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
  };

  const whoosh = (t, { from, to, peak, duration }) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(from, t);
    band.frequency.exponentialRampToValueAtTime(to, t + duration);
    src.connect(band).connect(envelope(t, peak, duration * 0.45, duration * 0.55));
    src.start(t);
    src.stop(t + duration + 0.05);
  };

  return {
    // Schedules every cue against the intro timeline ([start, duration] in ms).
    play(timeline, speed = 1) {
      const at = (ms) => ctx.currentTime + ms / 1000 / speed;
      const [boxStart] = timeline.boxIn;
      const [markStart] = timeline.markIn;
      const [dotStart, dotDuration] = timeline.dotDrop;
      const [slideStart, slideDuration] = timeline.slide;
      const [subStart] = timeline.subIn;
      const [dockStart, dockDuration] = timeline.dock;

      tone(at(boxStart), { from: 150, to: 70, peak: 0.35, decay: 0.16 });
      tone(at(markStart), { type: "triangle", from: 900, peak: 0.08, decay: 0.05 });
      // The dot lands at 70% of its drop.
      tone(at(dotStart + dotDuration * 0.7), { from: 1400, to: 1000, peak: 0.16, decay: 0.12 });
      whoosh(at(slideStart), { from: 350, to: 1600, peak: 0.12, duration: slideDuration / 1000 / speed });
      tone(at(subStart), { from: 660, peak: 0.06, attack: 0.02, decay: 1.1 });
      tone(at(subStart + 40), { from: 990, peak: 0.04, attack: 0.02, decay: 1.0 });
      whoosh(at(dockStart), { from: 1400, to: 450, peak: 0.07, duration: dockDuration / 1000 / speed });
    },
    stop() {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.12);
      setTimeout(() => ctx.close(), 200);
    },
    close() {
      setTimeout(() => ctx.close(), 1500);
    },
  };
}
