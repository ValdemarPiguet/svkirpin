const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelector(".nav__links");

if (header) {
  const setHeaderState = () => header.classList.toggle("scrolled", window.scrollY > 8);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initHeroEnergyScene() {
  const scene = document.querySelector(".energy-flow");
  if (!scene) return;

  scene.setAttribute("aria-label", "Energy flow from grid to battery to building");
  scene.innerHTML = `
    <defs>
      <linearGradient id="energy-charge" x1="0" x2="1">
        <stop offset="0" stop-color="#FFD700"></stop>
        <stop offset="1" stop-color="#F2A93B"></stop>
      </linearGradient>
    </defs>
    <g class="energy-node energy-node--grid">
      <path d="M58 92v144M110 92v144M58 110h52M58 144h52M58 178h52M58 212h52" stroke="#0057B7" stroke-width="5" stroke-linecap="round"></path>
      <path d="M42 92h84M42 236h84" stroke="#0057B7" stroke-width="5" stroke-linecap="round"></path>
      <path d="M84 92V66M84 66l-24-18M84 66l24-18" stroke="#0057B7" stroke-width="4" stroke-linecap="round" fill="none"></path>
      <circle cx="84" cy="66" r="7" fill="#FFD700" stroke="#0057B7" stroke-width="3"></circle>
    </g>
    <g class="energy-node energy-node--ess">
      <rect x="214" y="98" width="92" height="138" rx="14" fill="#FFFFFF" stroke="#0057B7" stroke-width="5"></rect>
      <rect x="240" y="82" width="40" height="16" rx="5" fill="#0057B7"></rect>
      <rect x="232" y="126" width="56" height="82" rx="5" fill="#F2F6FB" stroke="#E1E7F0" stroke-width="2"></rect>
      <rect class="energy-charge" x="232" y="208" width="56" height="0" rx="5" fill="url(#energy-charge)"></rect>
      <path d="M258 144l-12 24h12l-8 20 22-28h-13z" fill="#FFD700"></path>
    </g>
    <g class="energy-node energy-node--load">
      <path d="M372 236v-98l54-46 54 46v98z" fill="#F2F6FB" stroke="#0057B7" stroke-width="5"></path>
      <path d="M360 140l66-58 66 58M398 236v-54h56v54" fill="none" stroke="#0057B7" stroke-width="5" stroke-linejoin="round"></path>
      <rect x="420" y="198" width="16" height="38" fill="#DCEBFB" stroke="#0057B7" stroke-width="3"></rect>
    </g>
    <path class="energy-flow__rail" d="M134 174H214M306 174H372" fill="none" stroke="#DCEBFB" stroke-width="8" stroke-linecap="round"></path>
    <path id="energy-flow-path" class="energy-flow__path" d="M134 174H372" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round"></path>
    <circle class="energy-flow__pulse" cx="134" cy="174" r="9" fill="#FFD700" stroke="#0057B7" stroke-width="3"></circle>
    <text x="68" y="274" fill="#54607A" font-size="16">GRID</text>
    <text x="244" y="268" fill="#54607A" font-size="16">ESS</text>
    <text x="404" y="274" fill="#54607A" font-size="16">LOAD</text>
  `;

  const visual = scene.closest(".energy-visual");
  if (visual && !visual.querySelector(".energy-flow__explanation")) {
    const isEnglish = document.documentElement.lang === "en";
    visual.insertAdjacentHTML("beforeend", `
      <div class="energy-flow__explanation">
        <p class="energy-flow__explanation-title">${isEnglish ? "How the system works" : "Як працює система"}</p>
        <div class="energy-flow__steps">
          <p><strong>1.</strong> ${isEnglish ? "Energy is stored in the ESS when the grid is available." : "Накопичення енергії в ESS, коли мережа доступна."}</p>
          <p><strong>2.</strong> ${isEnglish ? "The ESS powers critical infrastructure during outages: elevators, pumps, and lighting." : "Під час перебоїв ESS живить критичну інфраструктуру: ліфти, насоси та освітлення."}</p>
        </div>
      </div>
    `);
  }
}

initHeroEnergyScene();

function bindFilterGroup(group) {
  const buttons = group.querySelectorAll("[data-filter]");
  const cards = group.parentElement.querySelectorAll(`[data-filter-target="${group.dataset.filterGroup}"]`);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        const isFiltered = value !== "all" && !tags.includes(value);
        card.hidden = isFiltered;
        card.classList.toggle("is-filtered", isFiltered);
      });
    });
  });
}

async function renderProducts() {
  const mount = document.querySelector("[data-product-line]");
  if (!mount) return;

  const lineId = mount.dataset.productLine;
  const lang = document.documentElement.lang === "en" ? "en" : "uk";
  const dataPath = mount.dataset.productsPath || "../../data/products.json";
  const productsImagePath = dataPath.replace("data/products.json", "assets/img/products/");

  try {
    const response = await fetch(dataPath);
    const payload = await response.json();
    const line = payload.lines.find((item) => item.id === lineId);
    if (!line) return;

    document.querySelectorAll("[data-product-title]").forEach((node) => {
      node.textContent = line.title[lang];
    });
    document.querySelectorAll("[data-product-intro]").forEach((node) => {
      node.textContent = line.description[lang];
    });

    mount.innerHTML = line.models.map((model) => {
      const specs = model.specs.map((spec) => `
        <tr>
          <th scope="row">${spec.label[lang]}</th>
          <td>${spec.value}</td>
        </tr>
      `).join("");

      return `
        <article class="card product-card reveal">
          <div class="product-card__content">
            <span class="badge">${line.manufacturer}</span>
            <h2>${model.name}</h2>
            <p>${model.summary[lang]}</p>
            <table class="spec-table" aria-label="${model.name} specifications">
              <tbody>${specs}</tbody>
            </table>
            <p class="section__lead"><small>${lang === "uk" ? "Джерело" : "Source"}: ${model.source}</small></p>
          </div>
          ${model.image ? `
          <div class="card__media product-card__media">
            <img src="${productsImagePath}${model.image}" alt="${model.name}" loading="lazy">
          </div>` : ""}
        </article>
      `;
    }).join("");

    document.dispatchEvent(new Event("content:rendered"));
  } catch (error) {
    mount.innerHTML = `<p>${lang === "uk" ? "Не вдалося завантажити характеристики." : "Unable to load specifications."}</p>`;
  }
}

async function renderHomepageSolutions() {
  const mount = [...document.querySelectorAll("main .grid--cards")]
    .find((grid) => grid.querySelector("h3")?.textContent.trim() === "Sentinal");
  if (!mount) return;

  const lang = document.documentElement.lang === "en" ? "en" : "uk";
  const dataPath = lang === "en" ? "../data/products.json" : "data/products.json";
  const imagePath = dataPath.replace("data/products.json", "assets/img/products/");
  const featuredIds = ["ztek-sentinal", "pylontech-force-h3x", "ztek-quantum"];
  const homepageImages = {
    "ztek-sentinal": "Sentinal.webp",
    "pylontech-force-h3x": "Pylontech-Force-H3X.webp",
    "ztek-quantum": "ZTTEK-Quantum.webp"
  };

  try {
    const response = await fetch(dataPath);
    const payload = await response.json();
    const lines = featuredIds.map((id) => payload.lines.find((line) => line.id === id));

    mount.innerHTML = lines.map((line) => {
      const image = homepageImages[line.id];
      const imageMarkup = image ? `
        <div class="card__media">
          <img src="${imagePath}${image}" alt="${line.title[lang]}" loading="lazy">
        </div>` : "";

      return `
        <article class="card homepage-solution-card reveal">
          ${imageMarkup}
          <span class="badge">${line.manufacturer}</span>
          <h3>${line.title[lang]}</h3>
          <p>${line.description[lang]}</p>
          <a class="button button--secondary" href="pages/products/${line.id}.html">${lang === "en" ? "Details" : "Детальніше"}</a>
        </article>
      `;
    }).join("");
    mount.querySelectorAll(".reveal").forEach((card) => card.classList.add("is-visible"));
    document.dispatchEvent(new Event("content:rendered"));
  } catch (error) {
    return;
  }
}

async function renderSolutions() {
  const filterGroup = document.querySelector('[data-filter-group="solutions"]');
  if (!filterGroup) return;

  const mount = filterGroup.parentElement.querySelector(".grid--cards");
  const lang = document.documentElement.lang === "en" ? "en" : "uk";
  const dataPath = lang === "en" ? "../../data/products.json" : "../data/products.json";
  const imagePath = dataPath.replace("data/products.json", "assets/img/products/");
  const productPages = {
    "ztek-hearth": "products/ztek-hearth.html",
    "ztek-sentinal": "products/ztek-sentinal.html",
    "ztek-quantum": "products/ztek-quantum.html",
    "ztek-spark": "products/ztek-spark.html",
    "pylontech-residential": "products/pylontech-residential.html",
    "pylontech-force-h3x": "products/pylontech-force-h3x.html"
  };

  try {
    const response = await fetch(dataPath);
    const payload = await response.json();

    mount.innerHTML = payload.lines.map((line) => {
      const image = line.models.find((model) => model.image)?.image;
      const imageMarkup = image ? `
        <div class="card__media">
          <img src="${imagePath}${image}" alt="${line.title[lang]}" loading="lazy">
        </div>` : "";

      return `
        <article class="card reveal" data-filter-target="solutions" data-tags="${line.solutionTags.join(" ")}">
          ${imageMarkup}
          <span class="badge">${line.manufacturer}</span>
          <h2>${line.title[lang]}</h2>
          <p>${line.description[lang]}</p>
          <a class="button button--secondary" href="${productPages[line.id]}">${lang === "en" ? "Details" : "Детальніше"}</a>
        </article>
      `;
    }).join("");

    bindFilterGroup(filterGroup);
    document.dispatchEvent(new Event("content:rendered"));
  } catch (error) {
    mount.innerHTML = `<p>${lang === "en" ? "Unable to load solutions." : "Не вдалося завантажити рішення."}</p>`;
  }
}

renderHomepageSolutions();
renderSolutions();
renderProducts();
