/* ============================================================
   PORTFOLIO INTERACTIVITY (v2)
   Fixes: all element references are declared BEFORE any function
   that uses them (the previous version referenced scrollTopBtn
   inside onScroll() before its const declaration, which threw a
   ReferenceError and silently killed every feature below it).

   Features:
   - Mobile hamburger menu
   - Dark/light mode toggle (localStorage persistence)
   - Navbar scrolled state + active-link highlighting
   - Scroll reveal animations (IntersectionObserver)
   - Stats counter animation
   - Typewriter hero tagline
   - Case study modal
   - Contact form thank-you message
   - Scroll-to-top button
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Element references (declared FIRST) ---------- */
  const root = document.documentElement;
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
  const themeIconDesktop = themeToggleDesktop ? themeToggleDesktop.querySelector("i") : null;
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const typewriterEl = document.getElementById("typewriter");
  const modal = document.getElementById("case-study-modal");
  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalImage = document.getElementById("modal-image");
  const modalImageTrigger = document.getElementById("modal-image-trigger");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const scrollTopBtn = document.getElementById("scroll-top");

  /* ----------------------------------------------------------
     1. MOBILE HAMBURGER MENU
     ---------------------------------------------------------- */
  const navOverlay = document.getElementById("nav-overlay");

  let savedScrollY = 0;

  function closeMobileMenu() {
    navMenu.classList.remove("open");
    hamburger.classList.remove("open");
    navOverlay.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    window.scrollTo(0, savedScrollY);
  }

  function openMobileMenu() {
    savedScrollY = window.scrollY;
    navMenu.classList.add("open");
    hamburger.classList.add("open");
    navOverlay.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  // Hamburger click
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (navMenu.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Click overlay to close
  navOverlay.addEventListener("click", closeMobileMenu);

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("open")) {
      const isHamburger = hamburger.contains(e.target);
      const isNavMenu = navMenu.contains(e.target);
      const isOverlay = navOverlay.contains(e.target);
      if (!isHamburger && !isNavMenu && !isOverlay) {
        closeMobileMenu();
      }
    }
  });

  // Close on nav link click
  navLinks.forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
  );

  /* ----------------------------------------------------------
     2. DARK / LIGHT MODE TOGGLE
        - Respects system preference on first visit
        - localStorage overrides system preference once toggled
        - Listens for OS theme changes when no manual override
     ---------------------------------------------------------- */
  const STORAGE_KEY = "portfolio-theme";

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    const iconClass = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    themeIcon.className = iconClass;
    if (themeIconDesktop) themeIconDesktop.className = iconClass;
    if (save) localStorage.setItem(STORAGE_KEY, theme);
  }

  // Determine initial theme: saved override > system preference > dark
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  applyTheme(savedTheme || getSystemTheme(), false);

  // Toggle button: saves the choice so it persists across visits
  function toggleTheme() {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next, true);
  }
  themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", toggleTheme);

  // Follow live OS changes unless the user has manually toggled
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "light" : "dark", false);
    }
  });

  /* ----------------------------------------------------------
     3. NAVBAR: SCROLLED STATE + ACTIVE LINK + SCROLL-TOP VISIBILITY
     ---------------------------------------------------------- */
  function onScroll() {
    const scrollPos = window.scrollY;

    navbar.classList.toggle("scrolled", scrollPos > 40);

    let currentId = "home";
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop - 120) currentId = section.id;
    });
    navLinks.forEach((link) =>
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentId}`,
      ),
    );

    scrollTopBtn.classList.toggle("visible", scrollPos > 500);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // set initial state

  /* ----------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     ---------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((el) => revealObserver.observe(el));

    /* --------------------------------------------------------
       5. STATS COUNTERS — count up when scrolled into view
       -------------------------------------------------------- */
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const counter = entry.target;
          const target = parseInt(counter.dataset.target, 10);
          const duration = 1400;
          const start = performance.now();

          (function tick(now) {
            const progress = Math.min(
              ((now || performance.now()) - start) / duration,
              1,
            );
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out
            counter.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
          })();

          observer.unobserve(counter);
        });
      },
      { threshold: 0.6 },
    );
    document
      .querySelectorAll(".stat-number")
      .forEach((el) => statObserver.observe(el));
  } else {
    // Very old browser fallback: show everything immediately
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("visible"));
    document.querySelectorAll(".stat-number").forEach((el) => {
      el.textContent = el.dataset.target;
    });
  }

  /* ----------------------------------------------------------
     7. TYPEWRITER EFFECT — hero tagline
     ---------------------------------------------------------- */
  const phrases = [
    "Building systems, solving problems, and designing experiences.",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  (function type() {
    const phrase = phrases[phraseIndex];
    typewriterEl.textContent = phrase.slice(0, charIndex);

    let delay = deleting ? 28 : 55;

    if (!deleting && charIndex === phrase.length) {
      delay = 3200; // pause when sentence is complete
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length; // loop phrases
      delay = 400;
    } else {
      charIndex += deleting ? -1 : 1;
    }
    setTimeout(type, delay);
  })();

  /* ----------------------------------------------------------
     8. CASE STUDY MODAL
     ---------------------------------------------------------- */
  const caseStudies = {
    pos: {
      category: "Web Development · Database Design",
      title: "Restaurant Point of Sale System",
      image: "assets/Restaurant POS.png",
      alt: "Restaurant Point of Sale System dashboard screenshot",
      body: `
        <h4>Overview</h4>
        <p>A full-featured POS system built with Python Flask and PostgreSQL to streamline daily operations
           for small-to-medium restaurants — covering orders, inventory, reporting, and billing.</p>
        <h4>My Role</h4>
        <p>Designed the normalized database schema, developed the front end with Bootstrap,
           implemented role-based authentication (cashier/admin), and built PDF invoice generation.</p>
        <h4>Key Features</h4>
        <ul>
          <li>Order entry &amp; management with live status tracking</li>
          <li>Real-time inventory updates on every sale</li>
          <li>Sales reports &amp; analytics dashboard</li>
          <li>PDF invoice generation</li>
          <li>Cashier/admin role-based access control</li>
        </ul>
        <h4>Challenges &amp; Solutions</h4>
        <p>Concurrency during peak hours was handled with transactional database updates,
           ensuring inventory counts never drift out of sync.</p>
      `,
    },
    billing: {
      category: "Database Management · Web App",
      title: "School Fee Management System",
      image: "assets/Dashboard.png",
      alt: "School Fee Management System dashboard screenshot",
      body: `
        <h4>Overview</h4>
        <p>A comprehensive billing platform that tracks student fees, generates payment
           receipts, and gives administrators real-time visibility into outstanding balances.</p>
        <h4>Key Features</h4>
        <ul>
          <li>Student registration &amp; flexible fee structures</li>
          <li>Payment tracking with auto-generated receipts</li>
          <li>Outstanding balance alerts</li>
          <li>Monthly/yearly financial reports</li>
        </ul>
        <h4>Outcome</h4>
        <p>Replaced spreadsheet-based fee tracking with an auditable, centralized system,
           dramatically reducing manual bookkeeping time.</p>
      `,
    },
    madaraka: {
      category: "Graphic Design · Branding",
      title: "Madaraka Day School Campaign Poster",
      image: "assets/HAPPY MADARAKA DAY.png",
      alt: "Madaraka Day school campaign poster",
      body: `
        <h4>Design Brief</h4>
        <p>Create a patriotic, eye-catching poster for a school's Madaraka Day celebration,
           shared digitally and printed for display.</p>
        <h4>Approach</h4>
        <ul>
          <li>Built around Kenya's national colors for instant recognition</li>
          <li>Bold typography hierarchy for readability at a distance</li>
          <li>Optimized for both print and social media formats</li>
        </ul>
      `,
    },
    openday: {
      category: "Graphic Design · Print Design",
      title: "School Open Day Marketing Poster",
      image: "assets/School-poster-PNG.png",
      alt: "School open day marketing poster",
      body: `
        <h4>Design Brief</h4>
        <p>A recruitment poster for school open day events aimed at prospective students
           and their parents.</p>
        <h4>Approach</h4>
        <ul>
          <li>Clean layout with clear information hierarchy</li>
          <li>Vibrant but professional color palette</li>
          <li>Key details (date, venue, contact) placed for quick scanning</li>
        </ul>
      `,
    },
  };

  document.querySelectorAll(".case-study-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const study = caseStudies[btn.dataset.project];
      if (!study) return;
      modalCategory.textContent = study.category;
      modalTitle.textContent = study.title;
      modalImage.src = study.image;
      modalImage.alt = study.alt;
      modalBody.innerHTML = study.body;
      modal.classList.add("open");
      document.body.classList.add("no-scroll");
    });
  });

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(); // click on backdrop closes
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  /* ----------------------------------------------------------
     8b. LIGHTBOX — full-screen image viewer
     ---------------------------------------------------------- */
  function openLightbox() {
    lightboxImg.src = modalImage.src;
    lightboxImg.alt = modalImage.alt;
    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    // Only remove no-scroll if modal is also closed
    if (!modal.classList.contains("open")) {
      document.body.classList.remove("no-scroll");
    }
  }

  modalImageTrigger.addEventListener("click", openLightbox);
  modalImageTrigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox();
    }
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  /* ----------------------------------------------------------
   9. CONTACT FORM — sends to Formspree + thank-you message
   ---------------------------------------------------------- */
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formSuccess.hidden = false;
        contactForm.reset();
        setTimeout(() => (formSuccess.hidden = true), 6000);
      } else {
        alert("Oops! Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection and try again.");
    }
  });

  /* ----------------------------------------------------------
     10. SCROLL-TO-TOP BUTTON
     ---------------------------------------------------------- */
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
