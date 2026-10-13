
"use strict";

/* =========================================
   PERSONALIZACIÓN
   Usa el formato AAAA-MM-DD para las fechas.
========================================= */

const CONFIG = {
  birthdayDate: "2026-10-14",

  // Fecha en que comenzó la relación.
  // Sustituye este ejemplo por la fecha real.
  relationshipStart: "2016-05-23T00:00:00",

  photos: [
    {
      src: "assets/foto1.jpg",
      caption: "Ese momento en que sonreímos sin razón ♡"
    },
    {
      src: "assets/foto2.jpg",
      caption: "Contigo, todo es más bonito"
    },
    {
      src: "assets/foto3.jpg",
      caption: "Uno de mis recuerdos favoritos ♥"
    },
    {
      src: "assets/foto4.jpg",
      caption: "Momentos inolvidables"
    },{
      src: "assets/foto5.jpg",
      caption: "Guardados en nuestra memoria"
    },{
      src: "assets/foto6.jpg",
      caption: "Bonita foto"
    },{
      src: "assets/foto7.jpg",
      caption: "Siempre en las buenas y las malas"
    },{
      src: "assets/foto8.jpg",
      caption: "Y todavía nos quedan tantos momentos"
    }
  ],

  heartInterval: 850
};

/* =========================================
   REFERENCIAS
========================================= */

const $ = (selector) => document.querySelector(selector);

const loader = $("#loader");
const loaderHeart = $("#heart-loader");
const progressBar = $("#progress-bar");
const progressLabel = $("#progress-label");
const loaderMessage = $("#loader-message");
const mainContent = $("#main-content");
const music = $("#background-music");
const musicToggle = $("#music-toggle");

let loading = false;
let opened = false;
let musicPlaying = false;
let currentPhoto = 0;
let heartTimer = null;

/* =========================================
   FECHAS
========================================= */

function formatBirthday(dateString) {
  // Fecha local para evitar que la zona horaria
  // cambie el día que se muestra.
  const parts = dateString.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

$("#birthday-date").textContent =
  formatBirthday(CONFIG.birthdayDate);

/* =========================================
   LOADER INTERACTIVO + MÚSICA
========================================= */

loaderHeart.addEventListener("click", startExperience);

async function startExperience() {
  if (loading) return;
  loading = true;

  loaderHeart.disabled = true;
  loaderHeart.style.animation = "none";
  loaderMessage.textContent = "Preparando algo bonito para ti...";

  // Se intenta reproducir después de una interacción
  // real, ya que los navegadores suelen bloquear
  // el autoplay con sonido.
  music.volume = 0.35;

  try {
    await music.play();
    musicPlaying = true;
    updateMusicButton();
  } catch (error) {
    musicPlaying = false;
    console.info("La música necesita otro toque para reproducirse.");
  }

  musicToggle.classList.remove("hidden");

  const duration = 2400;
  const startTime = performance.now();

  function animateProgress(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const percent = Math.round(progress * 100);

    progressBar.style.width = `${percent}%`;
    progressLabel.textContent = `${percent}%`;

    if (progress < 1) {
      requestAnimationFrame(animateProgress);
      return;
    }

    loaderMessage.textContent = "Abriendo tu regalo...";

    setTimeout(() => {
      loader.classList.add("leaving");
      mainContent.classList.remove("hidden");
      document.body.classList.add("experience-started");

      initReveals();
      startFloatingHearts();

      setTimeout(() => {
        loader.remove();
      }, 850);
    }, 400);
  }

  requestAnimationFrame(animateProgress);
}

/* =========================================
   CONTROL DE MÚSICA
========================================= */

function updateMusicButton() {
  const icon = musicToggle.querySelector("i");

  icon.className = musicPlaying
    ? "bi bi-volume-up-fill"
    : "bi bi-volume-mute-fill";

  musicToggle.setAttribute(
    "aria-pressed",
    String(musicPlaying)
  );

  musicToggle.setAttribute(
    "aria-label",
    musicPlaying ? "Pausar música" : "Reproducir música"
  );
}

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicPlaying = true;
    } catch (error) {
      musicPlaying = false;
    }
  } else {
    music.pause();
    musicPlaying = false;
  }

  updateMusicButton();
});

music.addEventListener("play", () => {
  musicPlaying = true;
  updateMusicButton();
});

music.addEventListener("pause", () => {
  musicPlaying = false;
  updateMusicButton();
});

/* =========================================
   CARRUSEL DE FOTOS
========================================= */

const polaroid = $("#polaroid");
const carouselImage = $("#carousel-image");
const carouselCaption = $("#carousel-caption");
const dotsContainer = $("#carousel-dots");

function renderDots() {
  dotsContainer.replaceChildren();

  CONFIG.photos.forEach((photo, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver foto ${index + 1}`);

    dot.addEventListener("click", () => {
      showPhoto(index);
    });

    dotsContainer.appendChild(dot);
  });
}

function showPhoto(index) {
  currentPhoto =
    (index + CONFIG.photos.length) % CONFIG.photos.length;

  const photo = CONFIG.photos[currentPhoto];

  polaroid.classList.add("changing");

  setTimeout(() => {
    carouselImage.src = photo.src;
    carouselImage.alt = `Recuerdo ${currentPhoto + 1} juntos`;
    carouselCaption.textContent = photo.caption;

    const dots = dotsContainer.querySelectorAll(".carousel-dot");

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentPhoto);
      dot.setAttribute(
        "aria-current",
        dotIndex === currentPhoto ? "true" : "false"
      );
    });

    polaroid.classList.remove("changing");
  }, 180);
}

$("#prev-photo").addEventListener("click", () => {
  showPhoto(currentPhoto - 1);
});

$("#next-photo").addEventListener("click", () => {
  showPhoto(currentPhoto + 1);
});

// También permite deslizar con el dedo.
let touchStartX = 0;
let touchStartY = 0;

polaroid.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

polaroid.addEventListener("touchend", (event) => {
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
    showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
  }
}, { passive: true });

renderDots();
showPhoto(0);

/* =========================================
   SOBRE INTERACTIVO
========================================= */

const envelope = $("#envelope");
const envelopeHint = $("#envelope-hint");

envelope.addEventListener("click", () => {
  opened = !opened;

  envelope.classList.toggle("opened", opened);
  envelope.setAttribute("aria-expanded", String(opened));

  envelopeHint.innerHTML = opened
    ? '<i class="bi bi-heart-fill"></i> Una carta escrita para ti ♥'
    : '<i class="bi bi-envelope-heart"></i> Toca el sobre para descubrir tu carta';

  if (opened) {
    createHeartBurst();
  }
});


/* =========================================
   CONTADOR EN TIEMPO REAL
========================================= */

function calendarMonthsBetween(start, end) {
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() - start.getMonth();

  if (end.getDate() < start.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

function addCalendarMonths(date, months) {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

function updateCounter() {
  const start = new Date(CONFIG.relationshipStart);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || start > now) {
    return;
  }

  // Primero calculamos los meses completos de calendario.
  let totalMonths = calendarMonthsBetween(start, now);
  let anniversary = addCalendarMonths(start, totalMonths);

  // Evita que el aniversario calculado quede en el futuro.
  if (anniversary > now) {
    totalMonths--;
    anniversary = addCalendarMonths(start, totalMonths);
  }

  // Separamos los años y meses.
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // El tiempo restante se convierte en días, horas,
  // minutos y segundos, con sus respectivos arrastres.
  let remaining = Math.floor(
    (now.getTime() - anniversary.getTime()) / 1000
  );

  const days = Math.floor(remaining / 86400);
  remaining %= 86400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Actualizamos la pantalla.
  $("#years").textContent = years;
  $("#months").textContent = months;
  $("#days").textContent = days;
  $("#hours").textContent = hours;
  $("#minutes").textContent = minutes;
  $("#seconds").textContent = seconds;
}

// Actualiza inmediatamente y después cada segundo.
updateCounter();
setInterval(updateCounter, 1000);


/* =========================================
   CORAZONES FLOTANTES
========================================= */

const heartsLayer = $("#hearts-layer");

function createFloatingHeart() {
  if (!document.body.classList.contains("experience-started")) {
    return;
  }

  // Limitar la cantidad para no sobrecargar el móvil.
  if (heartsLayer.childElementCount > 18) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > 0.25 ? "♥" : "♡";

  heart.style.left = `${Math.random() * 96}%`;
  heart.style.fontSize = `${12 + Math.random() * 18}px`;
  heart.style.animationDuration = `${6 + Math.random() * 5}s`;

  heartsLayer.appendChild(heart);

  heart.addEventListener("animationend", () => {
    heart.remove();
  }, { once: true });
}

function startFloatingHearts() {
  if (heartTimer) return;

  createFloatingHeart();
  heartTimer = setInterval(
    createFloatingHeart,
    CONFIG.heartInterval
  );
}

function createHeartBurst() {
  for (let i = 0; i < 9; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "♥";
    heart.style.left = `${20 + Math.random() * 60}%`;
    heart.style.bottom = "35%";
    heart.style.fontSize = `${15 + Math.random() * 15}px`;
    heart.style.animationDuration = `${2 + Math.random() * 2}s`;

    heartsLayer.appendChild(heart);

    heart.addEventListener("animationend", () => {
      heart.remove();
    }, { once: true });
  }
}

/* =========================================
   APARICIÓN SUAVE DE LAS SECCIONES
========================================= */

function initReveals() {
  const elements = document.querySelectorAll(
    ".section-heading, .polaroid-stage, .time-card, " +
    ".special-photo-wrap, .special-section h2, .special-phrase"
  );

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  elements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}
