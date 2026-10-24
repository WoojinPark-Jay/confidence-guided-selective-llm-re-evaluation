const datasets = {
  reddit: {
    tab: "tab-reddit",
    status: "Exploratory evaluation",
    title: "Held-out Reddit test set",
    description: "Confidence routing sent 218 of 12,000 posts to Phase 2 and concentrated 98 Phase 1 errors in that subset.",
    phase1: "96.92%",
    final: "97.20%",
    change: "+0.28 percentage points",
    routeRate: "1.82%",
    routed: "218 of 12,000",
    corrected: "72",
    introduced: "38",
    net: "+34",
    inference: "Llama 3 SELF-DISCOVER",
    stat: "Phase 1 comparison: exact McNemar p = 0.00153; Holm-adjusted p = 0.0151 within the prespecified family.",
    caveat: "Differences between SELF-DISCOVER, Direct, and CoT were not statistically resolved on Reddit."
  },
  mixed: {
    tab: "tab-mixed",
    status: "Exploratory stress test",
    title: "Mixed Emotion stress test",
    description: "The controlled 300-example set emphasizes mixed or shifting affect; 86 examples were routed to Phase 2.",
    phase1: "83.67%",
    final: "92.67%",
    change: "+9.00 percentage points",
    routeRate: "28.67%",
    routed: "86 of 300",
    corrected: "28",
    introduced: "1",
    net: "+27",
    inference: "Llama 3 SELF-DISCOVER",
    stat: "Phase 1 comparison: exact McNemar p < 0.000001; Holm-adjusted p = 0.00000134 within the prespecified family.",
    caveat: "The 5% risk criterion was selected on Reddit calibration data; it does not guarantee 5% accepted risk under this distribution shift."
  },
  additional: {
    tab: "tab-additional",
    status: "Frozen-protocol evaluation",
    title: "Additional Reddit evaluation",
    description: "The classifier, temperature, threshold, prompts, and cached SELF-DISCOVER plan were fixed before this 9,000-post run.",
    phase1: "97.58%",
    final: "97.77%",
    change: "+0.19 percentage points",
    routeRate: "1.23%",
    routed: "111 of 9,000",
    corrected: "30",
    introduced: "13",
    net: "+17",
    inference: "Llama 3 SELF-DISCOVER",
    stat: "Phase 1 comparison: exact McNemar p = 0.0137; Holm-adjusted p = 0.0412 within the prespecified three-test family.",
    caveat: "SELF-DISCOVER versus Direct and CoT was not significant (both Holm-adjusted p = 0.9614)."
  }
};

const explorer = document.querySelector("[data-results-explorer]");

if (explorer) {
  const tabs = [...explorer.querySelectorAll("[role='tab']")];
  const panel = explorer.querySelector("[role='tabpanel']");

  const setDataset = (key, focusPanel = false) => {
    const dataset = datasets[key];
    if (!dataset) return;

    tabs.forEach((tab) => {
      const selected = tab.dataset.dataset === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panel.setAttribute("aria-labelledby", dataset.tab);
    Object.entries(dataset).forEach(([field, value]) => {
      if (field === "tab") return;
      const target = panel.querySelector(`[data-field='${field}']`);
      if (target) target.textContent = value;
    });

    if (focusPanel) panel.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setDataset(tab.dataset.dataset));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      setDataset(tabs[nextIndex].dataset.dataset);
    });
  });
}

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

const copyButton = document.querySelector('[data-copy-code]');

if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const code = copyButton.closest('.code-panel').querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      copyButton.textContent = 'Copied';
      window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1600);
    } catch {
      copyButton.textContent = 'Select text';
    }
  });
}

const dialog = document.querySelector('.figure-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  const dialogImage = dialog.querySelector('img');
  document.querySelectorAll('[data-expand]').forEach((button) => {
    button.addEventListener('click', () => {
      const sourceImage = button.querySelector('img');
      dialogImage.src = button.dataset.expand;
      dialogImage.alt = sourceImage.alt;
      dialog.showModal();
    });
  });

  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const current = link.getAttribute('href') === `#${visible.target.id}`;
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.1, 0.3] });

  sections.forEach((section) => observer.observe(section));
}
