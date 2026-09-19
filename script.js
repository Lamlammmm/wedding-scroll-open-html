const root = document.documentElement;
const openingScene = document.querySelector("#opening");
const openingGuideItems = [...document.querySelectorAll(".opening-guide li")];
const progressLinks = [...document.querySelectorAll(".progress-rail a")];
const progressLine = document.querySelector(".progress-rail-line i");

function updateScrollState() {
  const openingDistance = Math.max(1, openingScene.offsetHeight - window.innerHeight);
  const openingProgress = Math.min(1, Math.max(0, (window.scrollY - openingScene.offsetTop) / openingDistance));
  const doorProgress = openingProgress * openingProgress * (3 - 2 * openingProgress);
  const pageDistance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pageProgress = Math.min(1, Math.max(0, window.scrollY / pageDistance));

  root.style.setProperty("--open-progress", openingProgress.toFixed(3));
  root.style.setProperty("--door-left-angle", `${(-104 * doorProgress).toFixed(2)}deg`);
  root.style.setProperty("--door-right-angle", `${(104 * doorProgress).toFixed(2)}deg`);
  root.style.setProperty("--door-shade", Math.max(0.54, 1 - doorProgress * 0.46).toFixed(3));
  root.style.setProperty("--reveal-blur", `${(12 * (1 - doorProgress)).toFixed(2)}px`);
  root.style.setProperty("--reveal-brightness", (0.58 + doorProgress * 0.42).toFixed(3));
  root.style.setProperty("--light-spread", (0.018 + doorProgress * 0.982).toFixed(3));
  root.style.setProperty("--seam-opacity", Math.max(0, 1 - doorProgress * 2.4).toFixed(3));
  root.style.setProperty("--page-progress", pageProgress.toFixed(3));
  root.classList.toggle("is-opening-complete", openingProgress >= 0.98);
  progressLine.style.height = `${pageProgress * 100}%`;

  let guideIndex = 0;
  openingGuideItems.forEach((item, index) => {
    if (openingProgress >= Number(item.dataset.guide)) guideIndex = index;
  });
  openingGuideItems.forEach((item, index) => item.classList.toggle("is-active", index === guideIndex));
}

let scrollUpdateScheduled = false;

function scheduleScrollStateUpdate() {
  if (scrollUpdateScheduled) return;
  scrollUpdateScheduled = true;
  window.requestAnimationFrame(() => {
    updateScrollState();
    scrollUpdateScheduled = false;
  });
}

window.addEventListener("scroll", scheduleScrollStateUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollStateUpdate, { passive: true });
updateScrollState();

const openingParticles = document.querySelector(".opening-particles");
if (openingParticles) {
  const fragment = document.createDocumentFragment();
  const randomBetween = (minimum, maximum) => Math.random() * (maximum - minimum) + minimum;

  for (let index = 0; index < 24; index += 1) {
    const isPetal = index >= 18;
    const particle = document.createElement("span");
    particle.className = `opening-particle ${isPetal ? "opening-particle-petal" : "opening-particle-dust"}`;
    particle.style.setProperty("--particle-x", `${randomBetween(2, 98).toFixed(2)}%`);
    particle.style.setProperty("--particle-size", `${randomBetween(isPetal ? 5 : 1, isPetal ? 11 : 3.4).toFixed(2)}px`);
    particle.style.setProperty("--particle-duration", `${randomBetween(isPetal ? 9 : 8, isPetal ? 17 : 18).toFixed(2)}s`);
    particle.style.setProperty("--particle-delay", `${randomBetween(-18, 0).toFixed(2)}s`);
    particle.style.setProperty("--particle-drift", `${randomBetween(-140, 140).toFixed(1)}px`);
    particle.style.setProperty("--particle-opacity", randomBetween(0.12, isPetal ? 0.38 : 0.34).toFixed(2));
    particle.style.setProperty("--particle-spin", `${randomBetween(240, 780).toFixed(1)}deg`);
    fragment.appendChild(particle);
  }

  openingParticles.appendChild(fragment);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const trackedSections = ["opening", "invitation", "details", "schedule", "locations", "gallery", "gift"]
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
const lightboxCounter = document.querySelector(".lightbox-counter");
const lightboxPrev = document.querySelector(".lightbox-arrow-prev");
const lightboxNext = document.querySelector(".lightbox-arrow-next");
const desiredGalleryImages = [
  "linh1900.jpg", "linh1785.jpg", "linh2172.jpg", "linh1911.jpg", "linh1887.jpg", "linh1919.jpg",
  "linh1831.jpg", "linh2187.jpg", "linh1394.jpg", "linh2183.jpg", "linh2010.jpg", "linh2020.jpg",
  "linh2032.jpg", "linh1946.jpg", "linh1972.jpg", "linh2054.jpg", "linh2089.jpg", "linh2130.jpg",
  "linh1892.jpg", "linh2093.jpg", "linh1862.jpg", "linh1876.jpg", "linh1824.jpg", "linh1839.jpg",
  "linh1865.jpg", "linh1895.jpg", "linh1922.jpg", "linh1914.jpg", "linh1845.jpg", "linh1938.jpg",
  "linh1877.jpg", "linh1857.jpg", "linh1920.jpg", "linh1882.jpg"
];
const galleryGrid = document.querySelector(".gallery-grid");
if (galleryGrid) {
  const existingCards = new Map([...galleryGrid.querySelectorAll(".gallery-card")].map((card) => {
    const src = card.querySelector("img")?.dataset.src || "";
    return [src.split("/").pop().split("?")[0].toLowerCase(), card];
  }));
  galleryGrid.innerHTML = "";
  desiredGalleryImages.forEach((name, index) => {
    const card = existingCards.get(name) || document.createElement("button");
    card.className = "gallery-card";
    card.type = "button";
    card.dataset.lightbox = `assets/photos/album/${name}`;
    card.dataset.caption = "Thu Hương & Văn Lâm";
    const img = card.querySelector("img") || document.createElement("img");
    img.dataset.src = `assets/photos/album/${name}`;
    img.removeAttribute("src");
    img.alt = `Ảnh cưới Thu Hương và Văn Lâm – ảnh ${String(index + 1).padStart(2, "0")}`;
    img.decoding = "async";
    const label = card.querySelector("span") || document.createElement("span");
    label.innerHTML = `${String(index + 1).padStart(2, "0")} · <b class="couple-names couple-names-gallery">Thu Hương &amp; Văn Lâm</b>`;
    card.replaceChildren(img, label);
    galleryGrid.appendChild(card);
  });
}
const galleryCards = [...document.querySelectorAll(".gallery-card")];
let galleryIndex = 0;
let lightboxIndex = 0;
let lightboxTouchStart = null;
const thumbnailStrip = document.querySelector(".lightbox-thumbnails");
const thumbnailButtons = galleryCards.map((card, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "lightbox-thumbnail";
  button.setAttribute("aria-label", `Xem ảnh ${index + 1}`);
  const image = document.createElement("img");
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.dataset.src = card.dataset.lightbox;
  button.appendChild(image);
  button.addEventListener("click", () => updateLightbox(index));
  thumbnailStrip.appendChild(button);
  return button;
});

function refreshThumbnails() {
  thumbnailButtons.forEach((button, index) => {
    button.setAttribute("aria-current", String(index === lightboxIndex));
    const image = button.querySelector("img");
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  });
  const active = thumbnailButtons[lightboxIndex];
  thumbnailStrip.scrollTo({ left: active.offsetLeft - thumbnailStrip.offsetLeft - (thumbnailStrip.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
}

function updateGallery() {
  galleryCards.forEach((card, index) => {
    const angle = ((index - galleryIndex) / galleryCards.length) * 360;
    const state = index === galleryIndex ? "is-active" : "is-wheel";
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isBack = normalizedAngle > 90 && normalizedAngle < 270;
    const frontDistance = Math.min(Math.abs(angle), 360 - Math.abs(angle));
    const clarity = Math.max(0.18, 1 - frontDistance / 180);
    card.classList.remove("is-active", "is-next", "is-prev", "is-far-next", "is-far-prev", "is-hidden", "is-back");
    card.classList.add(state);
    if (isBack) card.classList.add("is-back");
    card.style.setProperty("--wheel-angle", `${angle}deg`);
    card.style.setProperty("--wheel-clarity", clarity.toFixed(3));
    card.tabIndex = 0;
    card.setAttribute("aria-hidden", "false");
    const image = card.querySelector("img");
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  });
}

function moveGallery(direction) {
  galleryIndex = (galleryIndex + direction + galleryCards.length) % galleryCards.length;
  updateGallery();
  restartGalleryTimer();
}

let galleryTimer;
function restartGalleryTimer() {
  window.clearInterval(galleryTimer);
  galleryTimer = window.setInterval(() => {
    const bounds = galleryGrid.getBoundingClientRect();
    if (document.hidden || lightbox.open || bounds.bottom <= 0 || bounds.top >= window.innerHeight
      || galleryGrid.contains(document.activeElement)) return;
    moveGallery(1);
  }, 5000);
}

function updateLightbox(index) {
  lightboxIndex = (index + galleryCards.length) % galleryCards.length;
  galleryIndex = lightboxIndex;
  updateGallery();

  const card = galleryCards[lightboxIndex];
  const image = card.querySelector("img");
  const previousCard = galleryCards[(lightboxIndex - 1 + galleryCards.length) % galleryCards.length];
  const nextCard = galleryCards[(lightboxIndex + 1) % galleryCards.length];

  lightboxImage.src = card.dataset.lightbox;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = card.dataset.caption;
  lightboxCaption.classList.toggle("couple-names", card.dataset.caption === "Thu Hương & Văn Lâm");
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryCards.length}`;
  if (lightbox.open) refreshThumbnails();
  lightboxPrev.setAttribute("aria-label", `Xem ảnh trước: ${previousCard.dataset.caption}`);
  lightboxNext.setAttribute("aria-label", `Xem ảnh tiếp theo: ${nextCard.dataset.caption}`);

  [previousCard, nextCard].forEach((nearbyCard) => {
    const preloadImage = new Image();
    preloadImage.src = nearbyCard.dataset.lightbox;
  });
}

function moveLightbox(direction) {
  updateLightbox(lightboxIndex + direction);
}

document.querySelector(".gallery-arrow-prev").addEventListener("click", () => moveGallery(-1));
document.querySelector(".gallery-arrow-next").addEventListener("click", () => moveGallery(1));
updateGallery();
restartGalleryTimer();
lightbox.addEventListener("close", restartGalleryTimer);

giftTrigger.addEventListener("click", () => {
  giftDialog.showModal();
  giftTrigger.setAttribute("aria-expanded", "true");
});

giftDialog.querySelector(".dialog-close").addEventListener("click", () => {
  giftDialog.close();
  giftTrigger.setAttribute("aria-expanded", "false");
});

galleryCards.forEach((card, index) => {
  card.addEventListener("click", (event) => {
    if (card.classList.contains("gallery-card") && !card.classList.contains("is-active")) {
      event.preventDefault();
      galleryIndex = index;
      updateGallery();
      restartGalleryTimer();
      return;
    }
    updateLightbox(index);
    lightbox.showModal();
    refreshThumbnails();
  });
});

lightboxPrev.addEventListener("click", () => moveLightbox(-1));
lightboxNext.addEventListener("click", () => moveLightbox(1));
lightbox.querySelector(".dialog-close").addEventListener("click", () => lightbox.close());

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveLightbox(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveLightbox(1);
  }
});

lightboxImage.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  lightboxTouchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

lightboxImage.addEventListener("touchend", (event) => {
  if (!lightboxTouchStart) return;

  const touch = event.changedTouches[0];
  const distanceX = touch.clientX - lightboxTouchStart.x;
  const distanceY = touch.clientY - lightboxTouchStart.y;
  lightboxTouchStart = null;

  if (Math.abs(distanceX) >= 45 && Math.abs(distanceX) > Math.abs(distanceY)) {
    moveLightbox(distanceX > 0 ? -1 : 1);
  }
}, { passive: true });

const audio = document.querySelector("#wedding-audio");
const musicToggle = document.querySelector(".music-toggle");
const musicDiscBtn = document.querySelector(".music-disc-btn");

function setMusicState(isPlaying) {
  if (musicToggle) {
    musicToggle.classList.toggle("is-playing", isPlaying);
    musicToggle.setAttribute("aria-pressed", String(isPlaying));
    musicToggle.setAttribute("aria-label", isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền");
  }
  if (musicDiscBtn) {
    musicDiscBtn.classList.toggle("is-playing", isPlaying);
    musicDiscBtn.setAttribute("aria-label", isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền");
  }
}

function startMusic() {
  return audio.play().then(() => setMusicState(true));
}

function removeAutoplayFallback() {
  document.removeEventListener("pointerdown", autoplayFallback);
  document.removeEventListener("keydown", autoplayFallback);
}

function autoplayFallback(event) {
  if (event.target.closest?.(".music-toggle") || event.target.closest?.(".music-disc-btn")) return;
  startMusic().then(removeAutoplayFallback).catch(() => undefined);
}

startMusic().then(removeAutoplayFallback).catch(() => {
  document.addEventListener("pointerdown", autoplayFallback);
  document.addEventListener("keydown", autoplayFallback);
});

function toggleAudio() {
  if (audio.paused) {
    startMusic().then(removeAutoplayFallback).catch(() => undefined);
  } else {
    audio.pause();
    setMusicState(false);
  }
}

if (musicToggle) musicToggle.addEventListener("click", toggleAudio);
if (musicDiscBtn) musicDiscBtn.addEventListener("click", toggleAudio);

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

/* Xử lý sao chép STK & Toast */
const toast = document.querySelector("#toast");
let toastTimeout;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-show");
  }, 2400);
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const textToCopy = btn.getAttribute("data-copy");
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      showToast(`Đã sao chép số tài khoản: ${textToCopy}`);
    } catch (err) {
      showToast(`Không thể sao chép tự động: ${textToCopy}`);
    }
  });
});

/* Hiệu ứng cánh hoa rơi nhẹ (Falling Petals Canvas) */
(function setupPetalsCanvas() {
  const canvas = document.querySelector("#petals-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalCount = window.innerWidth < 768 ? 16 : 28;
  const petals = [];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 7;
      this.speedY = Math.random() * 0.9 + 0.55;
      this.speedX = Math.random() * 0.7 - 0.35;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.02;
      this.flip = Math.random() * Math.PI * 2;
      this.flipSpeed = Math.random() * 0.03 + 0.01;
      this.opacity = Math.random() * 0.45 + 0.35;
      // Gam màu hồng đào ánh son nhẹ nhàng
      const colors = [
        "rgba(242, 166, 178, ",
        "rgba(235, 138, 155, ",
        "rgba(217, 107, 126, ",
        "rgba(247, 194, 203, "
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.75 + this.speedX;
      this.angle += this.angularSpeed;
      this.flip += this.flipSpeed;

      if (this.y > height + 20 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(1, Math.cos(this.flip));

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, 0, this.size);
      ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size / 2, 0, 0);

      ctx.fillStyle = `${this.colorBase}${this.opacity})`;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    requestAnimationFrame(render);
  }

  render();
})();
