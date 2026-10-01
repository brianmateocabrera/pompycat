const CLOUDINARY_CLOUD_NAME = 'qlugtd3x';
const PHONE_NUMBER = '5493518189444';
const LOGO_PUBLIC_ID = 'logo.jpeg';

const GITHUB_FALLBACK_BASE =
  'https://raw.githubusercontent.com/brianmateocabrera/pompylenceria/main/images/';

const FAVORITES_KEY = 'catalogo_favoritos';

let allProducts = [];
let filteredProducts = [];
let activeCategory = 'Todos';
let currentProduct = null;
let currentModalImageIndex = 0;

// =========================
// DOM
// =========================

const catalog = document.getElementById('catalog');
const featuredCatalog = document.getElementById('featured-catalog');
const featuredSection = document.getElementById('featured-section');

const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');
const categoryFilters = document.getElementById('category-filters');

const catalogTitle = document.getElementById('catalog-title');
const productCount = document.getElementById('product-count');

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const retryBtn = document.getElementById('retry-btn');

const floatingWhatsapp = document.getElementById('floating-whatsapp');

const modal = document.getElementById('product-modal');
const modalBackdrop = modal?.querySelector('.modal-backdrop');
const modalClose = document.getElementById('modal-close');

const modalImage = document.getElementById('modal-image');
const modalThumbnails = document.getElementById('modal-thumbnails');

const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalPrice = document.getElementById('modal-price');
const modalDetails = document.getElementById('modal-details');

const modalFavorite = document.getElementById('modal-favorite');
const modalWhatsapp = document.getElementById('modal-whatsapp');

// =========================
// HEADER LOGO
// =========================

function initHeaderLogo() {
  const logo = document.getElementById('header-logo');

  if (!logo) return;

  logo.src = buildCloudinaryUrl(LOGO_PUBLIC_ID);
  logo.alt = 'Pompy Lencería';

  logo.onerror = () => {
    logo.onerror = null;
    logo.src = `${GITHUB_FALLBACK_BASE}${encodeURIComponent(LOGO_PUBLIC_ID)}`;
  };
}

// =========================
// IMÁGENES
// =========================

function buildCloudinaryUrl(publicId) {
  if (!publicId) return '';

  const cleanId = String(publicId).trim();

  if (!cleanId) return '';

  const hasExtension = /\.[a-z0-9]{2,5}$/i.test(cleanId);
  const finalId = hasExtension ? cleanId : `${cleanId}.jpg`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_800,f_auto,q_auto/${encodeURIComponent(
    finalId
  )}`;
}

function buildGitHubFallbackUrl(image) {
  if (!image) return '';

  const cleanImage = String(image).trim();

  if (!cleanImage) return '';

  return `${GITHUB_FALLBACK_BASE}${encodeURIComponent(cleanImage)}`;
}

function getImageUrl(image) {
  if (!image) return '';

  const value = String(image).trim();

  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return buildCloudinaryUrl(value);
}

function handleImageError(img, fallback) {
  if (!img || img.dataset.fallbackUsed === 'true') {
    return;
  }

  img.dataset.fallbackUsed = 'true';

  const fallbackUrl = buildGitHubFallbackUrl(fallback);

  if (fallbackUrl) {
    img.src = fallbackUrl;
  }
}

// =========================
// UTILIDADES
// =========================

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPrice(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const raw = String(value).trim();

  if (!raw) return '';

  const numeric = Number(
    raw
      .replace(/\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );

  if (!Number.isNaN(numeric)) {
    return `$${numeric.toLocaleString('es-AR')}`;
  }

  return raw.startsWith('$') ? raw : `$${raw}`;
}

function isTrue(value) {
  return ['true', 'TRUE', '1', 'si', 'sí', 'yes', 'x'].includes(
    String(value ?? '').trim()
  );
}

function getProductId(product, index) {
  return (
    product.id ||
    product.codigo ||
    product.sku ||
    product.modelo ||
    `producto-${index}`
  );
}

// =========================
// NORMALIZACIÓN PRODUCTOS
// =========================

function normalizeProduct(product, index) {
  const normalized = {};

  Object.entries(product || {}).forEach(([key, value]) => {
    normalized[String(key).trim().toLowerCase()] =
      typeof value === 'string' ? value.trim() : value;
  });

  const model =
    normalized.modelo ||
    normalized.model ||
    normalized.nombre ||
    normalized.name ||
    normalized.producto ||
    `Producto ${index + 1}`;

  const category =
    normalized.categoria ||
    normalized.category ||
    normalized.marca ||
    'Sin categoría';

  const image =
    normalized.imagen ||
    normalized.image ||
    normalized.imagen1 ||
    normalized.foto ||
    '';

  return {
    ...normalized,

    _id: getProductId(normalized, index),
    _model: model,
    _category: category,
    _image: image,

    _title:
      normalized.titulo ||
      normalized.title ||
      model,

    _subtitle:
      normalized.subtitulo ||
      normalized.subtitle ||
      normalized.descripcion_corta ||
      normalized.descripcion ||
      '',

    _description:
      normalized.descripcion ||
      normalized.description ||
      '',

    _price:
      normalized.precio ||
      normalized.price ||
      '',

    _visible: normalized.visible !== false && !/^false$/i.test(
      String(normalized.visible ?? '').trim()
    ),

    _available:
      normalized.disponible !== false &&
      !/^false$/i.test(String(normalized.disponible ?? '').trim())
  };
}

// =========================
// FAVORITOS
// =========================

function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isFavorite(productId) {
  return getFavorites().includes(String(productId));
}

function toggleFavorite(productId) {
  const id = String(productId);
  const favorites = getFavorites();

  const index = favorites.indexOf(id);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

  updateFavoriteButtons(id);

  return index < 0;
}

function updateFavoriteButtons(productId) {
  const id = String(productId);
  const favorite = isFavorite(id);

  document
    .querySelectorAll(`[data-favorite-id="${CSS.escape(id)}"]`)
    .forEach((button) => {
      button.classList.toggle('is-favorite', favorite);
      button.setAttribute(
        'aria-label',
        favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
      );

      const icon = button.querySelector('i');

      if (icon) {
        icon.className = favorite
          ? 'fa-solid fa-heart'
          : 'fa-regular fa-heart';
      }
    });
}

// =========================
// WHATSAPP
// =========================

function buildWhatsAppUrl(product) {
  const model =
    product?._title ||
    product?._model ||
    'este producto';

  const category =
    product?._category ||
    '';

  const price =
    product?._price ||
    '';

  const parts = [
    `Hola, quiero consultar por: ${model}.`
  ];

  if (category) {
    parts.push(`Categoría: ${category}.`);
  }

  if (price) {
    parts.push(`Precio publicado: ${formatPrice(price)}.`);
  }

  parts.push('¿Me pasás disponibilidad y opciones disponibles?');

  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
    parts.join(' ')
  )}`;
}

// =========================
// ESTADOS DEL CATÁLOGO
// =========================

function setCatalogState(state) {
  if (loadingState) loadingState.hidden = state !== 'loading';
  if (errorState) errorState.hidden = state !== 'error';
  if (emptyState) emptyState.hidden = state !== 'empty';

  if (catalog) {
    catalog.hidden = state !== 'ready';
  }
}

function showLoading() {
  setCatalogState('loading');
}

function showError() {
  setCatalogState('error');
}

function showEmpty() {
  setCatalogState('empty');
}

// =========================
// FETCH
// =========================

async function fetchProducts() {
  showLoading();

  if (catalog) {
    catalog.innerHTML = '';
  }

  try {
    const response = await fetch('/api/products', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const products = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

    allProducts = products
      .map(normalizeProduct)
      .filter((product) => product._visible && product._available);

    buildCategoryFilters();
    applyFilters();
    renderFeatured();

  } catch (error) {
    console.error('Error cargando productos:', error);

    allProducts = [];
    filteredProducts = [];

    if (productCount) {
      productCount.textContent = '0 productos';
    }

    showError();
  }
}

// =========================
// CATEGORÍAS
// =========================

function getCategories() {
  const categories = new Set();

  allProducts.forEach((product) => {
    const category = product._category;

    if (category) {
      categories.add(String(category).trim());
    }
  });

  return [...categories].sort((a, b) =>
    a.localeCompare(b, 'es', {
      sensitivity: 'base'
    })
  );
}

function buildCategoryFilters() {
  if (!categoryFilters) return;

  const categories = getCategories();

  categoryFilters.innerHTML = '';

  const allButton = document.createElement('button');

  allButton.type = 'button';
  allButton.className = 'category-chip is-active';
  allButton.textContent = 'Todos';
  allButton.dataset.category = 'Todos';

  categoryFilters.appendChild(allButton);

  categories.forEach((category) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'category-chip';
    button.textContent = category;
    button.dataset.category = category;

    categoryFilters.appendChild(button);
  });
}

function setActiveCategory(category) {
  activeCategory = category;

  document
    .querySelectorAll('.category-chip')
    .forEach((button) => {
      button.classList.toggle(
        'is-active',
        button.dataset.category === category
      );
    });

  applyFilters();
}

// =========================
// FILTROS
// =========================

function applyFilters() {
  const search = normalizeText(searchInput?.value || '');

  filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      activeCategory === 'Todos' ||
      normalizeText(product._category) === normalizeText(activeCategory);

    if (!matchesCategory) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableText = [
      product._title,
      product._model,
      product._subtitle,
      product._description,
      product._category,
      product.marca,
      product.talles,
      product.talle,
      product.colores,
      product.color,
      product.precio,
      product.price,
      product.codigo,
      product.sku
    ]
      .filter(Boolean)
      .join(' ');

    return normalizeText(searchableText).includes(search);
  });

  updateCatalogUI();
}

// =========================
// UI CATÁLOGO
// =========================

function updateCatalogUI() {
  const hasProducts = filteredProducts.length > 0;

  if (catalogTitle) {
    catalogTitle.textContent =
      activeCategory === 'Todos'
        ? 'Todos los productos'
        : activeCategory;
  }

  if (productCount) {
    productCount.textContent = `${filteredProducts.length} ${
      filteredProducts.length === 1 ? 'producto' : 'productos'
    }`;
  }

  if (!hasProducts) {
    if (catalog) {
      catalog.innerHTML = '';
    }

    showEmpty();
    return;
  }

  setCatalogState('ready');

  renderCatalog(filteredProducts);
}

// =========================
// RENDER CATÁLOGO
// =========================

function renderCatalog(products) {
  if (!catalog) return;

  catalog.innerHTML = products
    .map((product) => createCardHTML(product))
    .join('');
}

// =========================
// CARD
// =========================

function createCardHTML(product) {
  const image = getImageUrl(product._image);
  const fallback = product._image;

  const title = escapeHTML(product._title);
  const subtitle = escapeHTML(product._subtitle);
  const category = escapeHTML(product._category);

  const price = product._price
    ? escapeHTML(formatPrice(product._price))
    : '';

  const favorite = isFavorite(product._id);

  return `
    <article
      class="card"
      data-product-id="${escapeHTML(product._id)}"
      tabindex="0"
      role="button"
      aria-label="Ver ${title}"
    >
      <div class="card-image-wrapper">
        <img
          class="card-image"
          src="${escapeHTML(image)}"
          alt="${title}"
          loading="lazy"
          decoding="async"
          data-fallback="${escapeHTML(fallback)}"
        />

        <div class="card-overlay"></div>

        <button
          type="button"
          class="favorite-button ${favorite ? 'is-favorite' : ''}"
          data-favorite-id="${escapeHTML(product._id)}"
          aria-label="${
            favorite
              ? 'Quitar de favoritos'
              : 'Agregar a favoritos'
          }"
        >
          <i class="${
            favorite
              ? 'fa-solid fa-heart'
              : 'fa-regular fa-heart'
          }"></i>
        </button>

        <div class="card-content">
          ${
            category
              ? `<span class="card-category">${category}</span>`
              : ''
          }

          <h3 class="card-title">${title}</h3>

          ${
            subtitle
              ? `<p class="card-subtitle">${subtitle}</p>`
              : ''
          }

          ${
            price
              ? `<strong class="card-price">${price}</strong>`
              : ''
          }

          <span class="card-cta">
            Ver producto
            <i class="fa-solid fa-arrow-right"></i>
          </span>
        </div>
      </div>
    </article>
  `;
}

// =========================
// DESTACADOS
// =========================

function renderFeatured() {
  if (!featuredSection || !featuredCatalog) return;

  const featured = allProducts.filter((product) =>
    isTrue(product.destacado)
  );

  if (!featured.length) {
    featuredSection.hidden = true;
    return;
  }

  featuredSection.hidden = false;

  featuredCatalog.innerHTML = featured
    .map((product) => createCardHTML(product))
    .join('');
}

// =========================
// MODAL
// =========================

function getProductImages(product) {
  if (!product) return [];

  const images = [];

  for (let i = 1; i <= 5; i++) {
    const value =
      product[`imagen${i}`] ||
      product[`image${i}`] ||
      product[`foto${i}`];

    if (value) {
      images.push(String(value).trim());
    }
  }

  if (!images.length && product.imagen) {
    images.push(String(product.imagen).trim());
  }

  if (!images.length && product.image) {
    images.push(String(product.image).trim());
  }

  return [...new Set(images)];
}

function openProductModal(productId) {
  const product = allProducts.find(
    (item) => String(item._id) === String(productId)
  );

  if (!product || !modal) return;

  currentProduct = product;
  currentModalImageIndex = 0;

  renderModal();

  modal.hidden = false;
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    modal.classList.add('is-open');
  });
}

function closeProductModal() {
  if (!modal) return;

  modal.classList.remove('is-open');

  setTimeout(() => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }, 200);

  currentProduct = null;
}

function renderModal() {
  if (!currentProduct) return;

  const product = currentProduct;

  const images = getProductImages(product);

  if (modalCategory) {
    modalCategory.textContent = product._category || '';
  }

  if (modalTitle) {
    modalTitle.textContent = product._title || '';
  }

  if (modalDescription) {
    modalDescription.textContent =
      product._description ||
      product._subtitle ||
      '';
  }

  if (modalPrice) {
    modalPrice.textContent = product._price
      ? formatPrice(product._price)
      : '';
  }

  if (modalWhatsapp) {
    modalWhatsapp.href = buildWhatsAppUrl(product);
  }

  if (modalFavorite) {
    const favorite = isFavorite(product._id);

    modalFavorite.classList.toggle('is-favorite', favorite);

    modalFavorite.setAttribute(
      'aria-label',
      favorite
        ? 'Quitar de favoritos'
        : 'Agregar a favoritos'
    );

    const icon = modalFavorite.querySelector('i');

    if (icon) {
      icon.className = favorite
        ? 'fa-solid fa-heart'
        : 'fa-regular fa-heart';
    }

    modalFavorite.dataset.favoriteId = product._id;
  }

  renderModalDetails(product);
  renderModalGallery(images);
}

function renderModalDetails(product) {
  if (!modalDetails) return;

  const details = [];

  const addDetail = (label, value) => {
    if (!value) return;

    details.push(`
      <div class="modal-detail">
        <span>${escapeHTML(label)}</span>
        <strong>${escapeHTML(value)}</strong>
      </div>
    `);
  };

  addDetail('Talles', product.talles || product.talle);
  addDetail('Colores', product.colores || product.color);
  addDetail('Marca', product.marca);
  addDetail('Código', product.codigo || product.sku);

  modalDetails.innerHTML = details.join('');
}

function renderModalGallery(images) {
  if (!modalImage || !modalThumbnails) return;

  if (!images.length) {
    modalImage.removeAttribute('src');
    modalImage.alt = 'Imagen no disponible';
    modalThumbnails.innerHTML = '';
    return;
  }

  const currentImage = images[currentModalImageIndex] || images[0];

  modalImage.dataset.fallbackUsed = 'false';
  modalImage.dataset.fallback = currentImage;
  modalImage.src = getImageUrl(currentImage);
  modalImage.alt = currentProduct?._title || 'Producto';

  modalImage.onerror = () => {
    handleImageError(modalImage, currentImage);
  };

  modalThumbnails.innerHTML = images
    .map((image, index) => {
      const active =
        index === currentModalImageIndex
          ? 'is-active'
          : '';

      return `
        <button
          type="button"
          class="modal-thumbnail ${active}"
          data-modal-image-index="${index}"
          aria-label="Ver imagen ${index + 1}"
        >
          <img
            src="${escapeHTML(getImageUrl(image))}"
            alt=""
            loading="lazy"
          />
        </button>
      `;
    })
    .join('');
}

function changeModalImage(index) {
  if (!currentProduct) return;

  const images = getProductImages(currentProduct);

  if (!images.length) return;

  currentModalImageIndex =
    (index + images.length) % images.length;

  renderModalGallery(images);
}

// =========================
// EVENTOS
// =========================

document.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest(
    '[data-favorite-id]'
  );

  if (favoriteButton) {
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite(favoriteButton.dataset.favoriteId);

    if (
      currentProduct &&
      String(currentProduct._id) ===
        String(favoriteButton.dataset.favoriteId)
    ) {
      renderModal();
    }

    return;
  }

  const categoryButton = event.target.closest(
    '.category-chip'
  );

  if (categoryButton) {
    setActiveCategory(categoryButton.dataset.category);
    return;
  }

  const card = event.target.closest('.card');

  if (card) {
    openProductModal(card.dataset.productId);
    return;
  }

  const thumbnail = event.target.closest(
    '[data-modal-image-index]'
  );

  if (thumbnail) {
    changeModalImage(
      Number(thumbnail.dataset.modalImageIndex)
    );
  }
});

document.addEventListener('keydown', (event) => {
  const card = event.target.closest?.('.card');

  if (
    card &&
    (event.key === 'Enter' || event.key === ' ')
  ) {
    event.preventDefault();
    openProductModal(card.dataset.productId);
    return;
  }

  if (!currentProduct || modal?.hidden) return;

  if (event.key === 'Escape') {
    closeProductModal();
  }

  if (event.key === 'ArrowRight') {
    changeModalImage(currentModalImageIndex + 1);
  }

  if (event.key === 'ArrowLeft') {
    changeModalImage(currentModalImageIndex - 1);
  }
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    applyFilters();
  });
}

if (clearSearch) {
  clearSearch.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }

    applyFilters();
  });
}

if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    fetchProducts();
  });
}

if (modalClose) {
  modalClose.addEventListener('click', closeProductModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener(
    'click',
    closeProductModal
  );
}

// =========================
// WHATSAPP FLOTANTE
// =========================

if (floatingWhatsapp) {
  floatingWhatsapp.href = `https://wa.me/${PHONE_NUMBER}`;
  floatingWhatsapp.target = '_blank';
  floatingWhatsapp.rel = 'noopener noreferrer';
}

// =========================
// INICIALIZACIÓN
// =========================

document.addEventListener('DOMContentLoaded', () => {
  initHeaderLogo();
  fetchProducts();
});