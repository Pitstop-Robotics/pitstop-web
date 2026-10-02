import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import { inject } from "@vercel/analytics";
import "./style.css";
import { playIntro } from "./intro.js";
import { createIntroSound } from "./intro-sound.js";
import sunIcon from "@phosphor-icons/core/assets/regular/sun.svg?raw";
import moonIcon from "@phosphor-icons/core/assets/regular/moon.svg?raw";

inject();

const THEME_KEY = "pitstop:theme";
const THEME_COLORS = { light: "#F6F4E9", dark: "#12130F" };
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.querySelector("[data-theme-toggle]");

function savedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = THEME_COLORS[theme];
  const next = theme === "dark" ? "light" : "dark";
  themeToggle.innerHTML = theme === "dark" ? sunIcon : moonIcon;
  themeToggle.setAttribute("aria-label", `Switch to ${next} theme`);
  themeToggle.title = `Switch to ${next} theme`;
}

applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  const animate = document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate) document.startViewTransition(() => applyTheme(next));
  else applyTheme(next);
});

systemDark.addEventListener("change", (e) => {
  if (!savedTheme()) applyTheme(e.matches ? "dark" : "light");
});

playIntro(document.querySelector("[data-intro]"), {
  dockTarget: document.querySelector(".nav__brand .wm"),
  sound: createIntroSound,
});

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const SIGNUP_INBOX = "founders@pitstoprobotics.com";
const SIGNUP_ENDPOINT = `https://formsubmit.co/ajax/${SIGNUP_INBOX}`;

const form = document.querySelector("[data-signup]");
const input = form.querySelector("input[type=email]");
const honey = form.querySelector("[name=_honey]");
const button = form.querySelector("button");
const label = button.querySelector(".btn__label");
const row = form.querySelector(".signup__row");
const msg = form.querySelector(".signup__msg");
const DONE_LABEL = "Thanks, you're on the list";
const SENT_KEY = "pitstop:signups";
const LABEL_FADE_MS = 160;

function sentEmails() {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY)) || [];
  } catch {
    return [];
  }
}

function rememberEmail(email) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify([...new Set([...sentEmails(), email])]));
  } catch {}
}

const isStacked = () => getComputedStyle(row).gridTemplateColumns.trim().split(/\s+/).length === 1;

function centerButton() {
  const dx = isStacked() ? 0 : -(row.clientWidth - button.offsetWidth) / 2;
  button.style.setProperty("--dx", `${dx}px`);
}

function showDone() {
  form.dataset.state = "done";
  msg.textContent = `${DONE_LABEL}.`;
  input.readOnly = true;
  input.tabIndex = -1;
  button.disabled = true;

  const stacked = isStacked();
  const fromW = button.offsetWidth;
  if (!stacked) button.style.width = `${fromW}px`;
  label.classList.add("is-hidden");

  setTimeout(() => {
    label.textContent = DONE_LABEL;
    if (!stacked) {
      button.style.width = "auto";
      const toW = button.offsetWidth;
      button.style.width = `${fromW}px`;
      button.offsetWidth;
      button.style.width = `${toW}px`;
      button.style.setProperty("--dx", `${-(row.clientWidth - toW) / 2}px`);
    }
    label.classList.remove("is-hidden");
  }, LABEL_FADE_MS);

  new ResizeObserver(centerButton).observe(row);
}

const ERROR_CLEAR_MS = 5000;
let clearTimer;

function setMsg(text, state) {
  clearTimeout(clearTimer);
  msg.textContent = text;
  form.dataset.state = state;
  input.setAttribute("aria-invalid", state === "error" ? "true" : "false");
  if (state === "error") clearTimer = setTimeout(() => setMsg("", "idle"), ERROR_CLEAR_MS);
}

input.addEventListener("input", () => {
  if (form.dataset.state === "error") setMsg("", "idle");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.dataset.state === "loading" || form.dataset.state === "done") return;
  const email = input.value.trim();
  if (!email) return setMsg("", "idle"), input.focus();
  if (!EMAIL_RE.test(email) || email.includes("..")) return setMsg("Please enter a valid email.", "error"), input.focus();
  if (honey.value || sentEmails().includes(email.toLowerCase())) return showDone();

  setMsg("Sending...", "loading");
  button.disabled = true;
  try {
    const res = await fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        message: `${email} signed up for updates on the Pitstop Robotics website and may want to get in touch.`,
        page: location.href,
        _subject: `New website signup: ${email}`,
        _replyto: email,
        _template: "table",
        _captcha: "false",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.statusText);
    rememberEmail(email.toLowerCase());
    showDone();
  } catch {
    button.disabled = false;
    setMsg(`Something went wrong. Try again, or email ${SIGNUP_INBOX}.`, "error");
  }
});

for (const img of document.querySelectorAll("[data-media]")) {
  const markEmpty = () => img.closest(".media").classList.add("is-empty");
  if (img.complete && img.naturalWidth === 0) markEmpty();
  img.addEventListener("error", markEmpty);
}

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealEls = document.querySelectorAll(".reveal");
if (reduce || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.2 }
  );
  revealEls.forEach((el) => io.observe(el));
}
