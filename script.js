const root = document.documentElement;
const openingScene = document.querySelector("#opening");
const openingGuideItems = [...document.querySelectorAll(".opening-guide li")];
const progressLinks = [...document.querySelectorAll(".progress-rail a")];
const progressLine = document.querySelector(".progress-rail-line i");

function updateScrollState() {
  const openingDistance = Math.max(1, openingScene.offsetHeight - window.innerHeight);
  const openingProgress = Math.min(1, Math.max(0, (window.scrollY - openingScene.offsetTop) / openingDistance));
  const pageDistance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pageProgress = Math.min(1, Math.max(0, window.scrollY / pageDistance));

  root.style.setProperty("--open-progress", openingProgress.toFixed(3));
  root.style.setProperty("--page-progress", pageProgress.toFixed(3));
  progressLine.style.height = `${pageProgress * 100}%`;

  let guideIndex = 0;
  openingGuideItems.forEach((item, index) => {
    if (openingProgress >= Number(item.dataset.guide)) guideIndex = index;
  });
  openingGuideItems.forEach((item, index) => item.classList.toggle("is-active", index === guideIndex));
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const trackedSections = ["opening", "invitation", "details", "locations", "gallery", "gift"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateActiveLink() {
  const marker = window.innerHeight * 0.38;
  let activeId = "opening";
  trackedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) activeId = section.id;
  });

  progressLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
}

progressLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("resize", updateActiveLink);
updateActiveLink();

const countdownTarget = new Date("2026-10-18T00:00:00+07:00").getTime();
function updateCountdown() {
  const distance = Math.max(0, countdownTarget - Date.now());
  const values = {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor(distance / 3_600_000) % 24,
    minutes: Math.floor(distance / 60_000) % 60,
    seconds: Math.floor(distance / 1_000) % 60,
  };
  Object.entries(values).forEach(([key, value]) => {
    const element = document.querySelector(`[data-countdown="${key}"]`);
    if (element) element.textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

const giftDialog = document.querySelector("#gift-dialog");
const giftTrigger = document.querySelector(".gift-trigger");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const galleryCards = [...document.querySelectorAll(".gallery-card")];
let galleryIndex = 0;

function updateGallery() {
  const length = galleryCards.length;
  galleryCards.forEach((card, index) => {
    const relativeIndex = (index - galleryIndex + length) % length;
    const position = relativeIndex === 0 ? "active" : relativeIndex === 1 ? "next" : relativeIndex === length - 1 ? "prev" : "hidden";
    card.classList.remove("is-active", "is-next", "is-prev", "is-hidden");
    card.classList.add(`is-${position}`);
    card.tabIndex = position === "hidden" ? -1 : 0;
    card.setAttribute("aria-hidden", position === "hidden" ? "true" : "false");
  });
}

function moveGallery(direction) {
  galleryIndex = (galleryIndex + direction + galleryCards.length) % galleryCards.length;
  updateGallery();
}

document.querySelector(".gallery-arrow-prev").addEventListener("click", () => moveGallery(-1));
document.querySelector(".gallery-arrow-next").addEventListener("click", () => moveGallery(1));
updateGallery();

giftTrigger.addEventListener("click", () => {
  giftDialog.showModal();
  giftTrigger.setAttribute("aria-expanded", "true");
});

giftDialog.querySelector(".dialog-close").addEventListener("click", () => {
  giftDialog.close();
  giftTrigger.setAttribute("aria-expanded", "false");
});

document.querySelectorAll("[data-lightbox]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (card.classList.contains("gallery-card") && !card.classList.contains("is-active")) {
      event.preventDefault();
      moveGallery(card.classList.contains("is-next") ? 1 : -1);
      return;
    }
    lightboxImage.src = card.dataset.lightbox;
    lightboxImage.alt = card.querySelector("img").alt;
    lightboxCaption.textContent = card.dataset.caption;
    lightbox.showModal();
  });
});

lightbox.querySelector(".dialog-close").addEventListener("click", () => lightbox.close());

const audio = document.querySelector("#wedding-audio");
const musicToggle = document.querySelector(".music-toggle");
musicToggle.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().then(() => {
      musicToggle.classList.add("is-playing");
      musicToggle.setAttribute("aria-pressed", "true");
      musicToggle.setAttribute("aria-label", "Tắt nhạc nền");
    }).catch(() => undefined);
  } else {
    audio.pause();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Bật nhạc nền");
  }
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});
