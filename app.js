/*
const CLOUDINARY_CLOUD_NAME = 'qlugtd3x';
const PHONE_NUMBER = '5493518189444';
const LOGO_PUBLIC_ID = 'logo.jpeg';
const GITHUB_IMAGES_BASE_URL = 'https://raw.githubusercontent.com/brianmateocabrera/pompylenceria/main/images/';

function initHeaderLogo() {
  const logoImg = document.getElementById('header-logo');
  if (logoImg) {
    logoImg.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${LOGO_PUBLIC_ID}`;
  }
}

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Error al cargar datos');
    const products = await response.json();
    renderCatalog(products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

function buildCloudinaryUrl(publicId) {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  let cleanId = publicId.trim().replace(/^v\d+\//, '');
  const hasExtension = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(cleanId);
  const finalPath = hasExtension ? cleanId : `${cleanId}.jpg`;

  const transformations = 'w_600,f_auto,q_auto';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${encodeURI(finalPath)}`;
}

function buildGitHubFallbackUrl(publicId) {
  if (!publicId) return '';
  let cleanId = publicId.trim();
  const hasExtension = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(cleanId);
  const finalFilename = hasExtension ? cleanId : `${cleanId}.jpg`;
  return `${GITHUB_IMAGES_BASE_URL}${encodeURI(finalFilename)}`;
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[match]);
}

function renderCatalog(products) {
  const catalog = document.getElementById('catalog');
  if (!catalog) return;
  catalog.innerHTML = '';

  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    const normalized = {};
    Object.keys(product).forEach(key => {
      normalized[key.trim().toLowerCase()] = product[key];
    });

    const isVisible = String(normalized['visible'] || 'TRUE').trim().toUpperCase();
    const isDisponible = String(normalized['disponible'] || 'TRUE').trim().toUpperCase();

    if (isVisible === 'FALSE' || isDisponible === 'FALSE') return;

    const rawImg = normalized['imagen1'] || normalized['imagen_id'] || '';
    const rawTitle = normalized['modelo'] || normalized['id'] || normalized['titulo'] || '';
    const rawSubtitle = normalized['descripcion breve'] || normalized['subtitulo'] || '';
    const rawCategory = normalized['categoria'] || normalized['marca'] || '';
    const rawPrice = normalized['precio'] || '';

    if (!rawTitle && !rawImg) return;

    const imageUrl = buildCloudinaryUrl(rawImg);
    const fallbackUrl = buildGitHubFallbackUrl(rawImg);
    const title = escapeHTML(rawTitle);
    const subtitle = escapeHTML(rawSubtitle);
    const tag = escapeHTML(rawCategory);
    const price = escapeHTML(rawPrice);

    const waMessage = encodeURIComponent(`Hola, quiero consultar por: ${rawTitle}`);
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${waMessage}`;

    const imgTag = rawImg 
      ? `<img src="${imageUrl}" alt="${title}" class="card-bg" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='${fallbackUrl}';}">` 
      : '';

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      ${imgTag}
      <div class="card-overlay"></div>

      <button class="favorite-btn" aria-label="Guardar en favoritos">
        <i class="fa-regular fa-heart heart-icon"></i>
      </button>

      <div class="card-content">
        <h3 class="card-title">${title}</h3>
        <p class="card-subtitle">${subtitle}</p>
        
        <div class="card-meta">
          <span class="meta-item">
            <i class="fa-solid fa-tag"></i>
            ${tag}
          </span>
          <span class="meta-item font-semibold">
            <i class="fa-solid fa-dollar-sign"></i>
            ${price}
          </span>
        </div>

        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn">
          Consultar
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>
    `;
    fragment.appendChild(article);
  });

  catalog.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderLogo();
  fetchProducts();
});
*/
const CLOUDINARY_CLOUD_NAME = 'qlugtd3x';
const PHONE_NUMBER = '5493518189444';
const LOGO_PUBLIC_ID = 'logo.jpeg';

const GITHUB_IMAGES_BASE_URL =
  'https://raw.githubusercontent.com/brianmateocabrera/pompylenceria/main/images/';

const FAVORITES_STORAGE_KEY = 'catalogo_favoritos';

let allProducts = [];
let filteredProducts = [];
let activeCategory = 'Todos';
let currentProduct = null;
let currentModalImageIndex = 0;

/* =========================================================
   ELEMENTOS
========================================================= */

const elements = {
  logo: document.getElementById('header-logo'),

  catalog: document.getElementById('catalog'),
  featuredCatalog: document.getElementById('featured-catalog'),
  featuredSection: document.getElementById('featured-section'),

  searchInput: document.getElementById('search-input'),
  clearSearch: document.getElementById('clear-search'),
  categoryFilters: document.getElementById('category-filters'),

  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  emptyState: document.getElementById('empty-state'),
  retryBtn: document.getElementById('retry-btn'),

  catalogTitle: document.getElementById('catalog-title'),
  productCount: document.getElementById('product-count'),

  floatingWhatsapp: document.getElementById('floating-whatsapp'),

  modal: document.getElementById('product-modal'),
  modalClose: document.getElementById('modal-close'),
  modalImage: document.getElementById('modal-image'),
  modalThumbnails: document.getElementById('modal-thumbnails'),
  modalCategory: document.getElementById('modal-category'),
  modalTitle: document.getElementById('modal-title'),
  modalDescription: document.getElementById('modal-description'),
  modalPrice: document.getElementById('modal-price'),
  modalDetails: document.getElementById('modal-details'),
  modalFavorite: document.getElementById('modal-favorite'),
  modalWhatsapp: document.getElementById('modal-whatsapp')
};

/* =========================================================
   HEADER
========================================================= */

function initHeaderLogo() {
  if (!elements.logo) return;

  elements.logo.src =
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${LOGO_PUBLIC_ID}`;
}

/* =========================================================
   IMÁGENES
========================================================= */

function buildCloudinaryUrl(publicId, width = 800) {
  if (!publicId) return '';

  if (
    publicId.startsWith('http://') ||
    publicId.startsWith('https://')
  ) {
    return publicId;
  }

  let cleanId = String(publicId)
    .trim()
    .replace(/^v\d+\//, '');

  const hasExtension =
    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(cleanId);

  const finalPath = hasExtension
    ? cleanId
    : `${cleanId}.jpg`;

  const transformations =
    `w_${width},f_auto,q_auto`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${encodeURI(finalPath)}`;
}

function buildGitHubFallbackUrl(publicId) {
  if (!publicId) return '';

  let cleanId = String(publicId).trim();

  const hasExtension =
    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(cleanId);

  const finalFilename = hasExtension
    ? cleanId
    : `${cleanId}.jpg`;

  return `${GITHUB_IMAGES_BASE_URL}${encodeURI(finalFilename)}`;
}

function getImageUrl(publicId, width = 800) {
  return buildCloudinaryUrl(publicId, width);
}

/* =========================================================
   UTILIDADES
========================================================= */

function normalizeProduct(product) {
  const normalized = {};

  Object.keys(product || {}).forEach(key => {
    normalized[key.trim().toLowerCase()] = product[key];
  });

  return normalized;
}

function cleanValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function getBooleanValue(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value)
    .trim()
    .toUpperCase() !== 'FALSE';
}

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[match]);
}

function getProductId(product) {
  return cleanValue(
    product.id ||
    product.modelo ||
    product.titulo ||
    product.nombre ||
    crypto.randomUUID()
  );
}

function formatPrice(price) {
  if (!price) return '';

  const value = String(price).trim();

  if (
    value.startsWith('$') ||
    value.toLowerCase().includes('consultar')
  ) {
    return value;
  }

  return `$ ${value}`;
}

function splitValues(value) {
  if (!value) return [];

  return String(value)
    .split(/[,;|]/)
    .map(item => item.trim())
    .filter(Boolean);
}

/* =========================================================
   FAVORITOS
========================================================= */

function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(favorites)
  );
}

function isFavorite(productId) {
  return getFavorites().includes(productId);
}

function toggleFavorite(productId) {
  const favorites = getFavorites();

  const index = favorites.indexOf(productId);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(productId);
  }

  saveFavorites(favorites);

  updateFavoriteButtons(productId);
}

function updateFavoriteButtons(productId) {
  const favorite = isFavorite(productId);

  document
    .querySelectorAll(
      `[data-favorite-id="${CSS.escape(productId)}"]`
    )
    .forEach(button => {
      button.classList.toggle('is-favorite', favorite);

      const icon = button.querySelector('i');

      if (icon) {
        icon.className = favorite
          ? 'fa-solid fa-heart'
          : 'fa-regular fa-heart';
      }

      const text = button.querySelector('span');

      if (text) {
        text.textContent = favorite
          ? 'Guardado'
          : 'Guardar';
      }
    });
}

/* =========================================================
   WHATSAPP
========================================================= */

function buildWhatsAppUrl(product) {
  const title =
    product.modelo ||
    product.titulo ||
    product.nombre ||
    product.id ||
    'este producto';

  const category =
    product.categoria ||
    product.marca ||
    '';

  const price =
    product.precio ||
    '';

  let message =
    `Hola, quiero consultar por: ${title}`;

  if (category) {
    message += ` (${category})`;
  }

  if (price) {
    message += `. Precio publicado: ${formatPrice(price)}`;
  }

  message +=
    '. ¿Me pasás disponibilidad y opciones disponibles?';

  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initFloatingWhatsapp() {
  if (!elements.floatingWhatsapp) return;

  const message =
    'Hola, quiero hacer una consulta sobre el catálogo.';

  elements.floatingWhatsapp.href =
    `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* =========================================================
   OBTENER DATOS
========================================================= */

async function fetchProducts() {
  showLoading();

  try {
    const response = await fetch('/api/products', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }

    const products = await response.json();

    allProducts = products
      .map(normalizeProduct)
      .filter(product => {
        const visible = getBooleanValue(
          product.visible,
          true
        );

        const disponible = getBooleanValue(
          product.disponible,
          true
        );

        return visible && disponible;
      })
      .filter(product => {
        return (
          product.modelo ||
          product.titulo ||
          product.nombre ||
          product.id ||
          product.imagen1 ||
          product.imagen_id
        );
      })
      .map(product => ({
        ...product,
        _id: getProductId(product)
      }));

    createCategoryFilters();
    applyFilters();

    hideLoading();

  } catch (error) {
    console.error(error);
    showError();
  }
}

/* =========================================================
   CATEGORÍAS
========================================================= */

function getCategories() {
  const categories = new Set();

  allProducts.forEach(product => {
    const category =
      product.categoria ||
      product.marca ||
      '';

    if (category) {
      categories.add(category);
    }
  });

  return Array.from(categories).sort((a, b) =>
    a.localeCompare(b, 'es')
  );
}

function createCategoryFilters() {
  if (!elements.categoryFilters) return;

  elements.categoryFilters.innerHTML = '';

  const categories = [
    'Todos',
    ...getCategories()
  ];

  categories.forEach(category => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className =
      `category-btn${category === activeCategory ? ' active' : ''}`;

    button.textContent = category;

    button.addEventListener('click', () => {
      activeCategory = category;

      document
        .querySelectorAll('.category-btn')
        .forEach(btn => {
          btn.classList.toggle(
            'active',
            btn.textContent === activeCategory
          );
        });

      applyFilters();
    });

    elements.categoryFilters.appendChild(button);
  });
}

/* =========================================================
   FILTRADO
========================================================= */

function applyFilters() {
  const search =
    cleanValue(elements.searchInput?.value)
      .toLowerCase();

  filteredProducts = allProducts.filter(product => {
    const category =
      cleanValue(
        product.categoria ||
        product.marca
      );

    const matchesCategory =
      activeCategory === 'Todos' ||
      category === activeCategory;

    if (!matchesCategory) return false;

    if (!search) return true;

    const searchableText = [
      product.modelo,
      product.titulo,
      product.nombre,
      product.descripcion,
      product['descripcion breve'],
      product.categoria,
      product.marca,
      product.talles,
      product.talle,
      product.colores,
      product.color,
      product.precio
    ]
      .map(cleanValue)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(search);
  });

  renderCatalog(filteredProducts);
  renderFeatured();
  updateCatalogUI(search);
}

/* =========================================================
   RENDER PRODUCTOS
========================================================= */

function getProductTitle(product) {
  return cleanValue(
    product.modelo ||
    product.titulo ||
    product.nombre ||
    product.id
  );
}

function getProductSubtitle(product) {
  return cleanValue(
    product['descripcion breve'] ||
    product.subtitulo ||
    product.descripcion ||
    ''
  );
}

function getProductCategory(product) {
  return cleanValue(
    product.categoria ||
    product.marca ||
    ''
  );
}

function getProductImages(product) {
  const possibleFields = [
    'imagen1',
    'imagen2',
    'imagen3',
    'imagen4',
    'imagen5'
  ];

  const images = [];

  possibleFields.forEach(field => {
    const value = cleanValue(product[field]);

    if (value && !images.includes(value)) {
      images.push(value);
    }
  });

  if (!images.length) {
    const fallback = cleanValue(product.imagen_id);

    if (fallback) {
      images.push(fallback);
    }
  }

  return images;
}

function createProductCard(product) {
  const card = document.createElement('article');

  card.className = 'card';
  card.dataset.productId = product._id;

  const title = getProductTitle(product);
  const subtitle = getProductSubtitle(product);
  const category = getProductCategory(product);
  const price = cleanValue(product.precio);

  const images = getProductImages(product);
  const firstImage = images[0] || '';

  const image = document.createElement('img');

  image.className = 'card-bg';
  image.alt = title;
  image.loading = 'lazy';
  image.decoding = 'async';

  if (firstImage) {
    image.src = getImageUrl(firstImage, 600);

    image.onerror = () => {
      if (!image.dataset.fallback) {
        image.dataset.fallback = 'true';
        image.src = buildGitHubFallbackUrl(firstImage);
      }
    };
  }

  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';

  const favorite = document.createElement('button');

  favorite.type = 'button';
  favorite.className = 'favorite-btn';
  favorite.dataset.favoriteId = product._id;
  favorite.setAttribute(
    'aria-label',
    'Guardar en favoritos'
  );

  const favoriteIcon = document.createElement('i');

  favorite.appendChild(favoriteIcon);

  if (isFavorite(product._id)) {
    favorite.classList.add('is-favorite');
    favoriteIcon.className = 'fa-solid fa-heart';
  } else {
    favoriteIcon.className = 'fa-regular fa-heart';
  }

  favorite.addEventListener('click', event => {
    event.stopPropagation();
    toggleFavorite(product._id);
  });

  const content = document.createElement('div');
  content.className = 'card-content';

  const titleElement = document.createElement('h3');
  titleElement.className = 'card-title';
  titleElement.textContent = title;

  content.appendChild(titleElement);

  if (subtitle) {
    const subtitleElement = document.createElement('p');

    subtitleElement.className = 'card-subtitle';
    subtitleElement.textContent = subtitle;

    content.appendChild(subtitleElement);
  }

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';

  if (category) {
    const categoryElement = document.createElement('span');

    categoryElement.className = 'card-category';
    categoryElement.textContent = category;

    bottom.appendChild(categoryElement);
  }

  if (price) {
    const priceElement = document.createElement('span');

    priceElement.className = 'card-price';
    priceElement.textContent = formatPrice(price);

    bottom.appendChild(priceElement);
  }

  content.appendChild(bottom);

  const cta = document.createElement('div');

  cta.className = 'card-cta';
  cta.textContent = 'Ver producto';

  content.appendChild(cta);

  card.append(
    image,
    overlay,
    favorite,
    content
  );

  card.addEventListener('click', () => {
    openProductModal(product);
  });

  return card;
}

function renderCatalog(products) {
  elements.catalog.innerHTML = '';

  const fragment =
    document.createDocumentFragment();

  products.forEach(product => {
    fragment.appendChild(
      createProductCard(product)
    );
  });

  elements.catalog.appendChild(fragment);
}

/* =========================================================
   DESTACADOS
========================================================= */

function isFeatured(product) {
  return String(
    product.destacado ||
    product.featured ||
    ''
  )
    .trim()
    .toUpperCase() === 'TRUE';
}

function renderFeatured() {
  if (!elements.featuredSection) return;

  const featured = allProducts
    .filter(isFeatured)
    .slice(0, 6);

  if (!featured.length) {
    elements.featuredSection.hidden = true;
    return;
  }

  const fragment =
    document.createDocumentFragment();

  featured.forEach(product => {
    fragment.appendChild(
      createProductCard(product)
    );
  });

  elements.featuredCatalog.innerHTML = '';
  elements.featuredCatalog.appendChild(fragment);

  elements.featuredSection.hidden =
    Boolean(
      elements.searchInput?.value ||
      activeCategory !== 'Todos'
    );
}

/* =========================================================
   UI
========================================================= */

function updateCatalogUI(search) {
  if (!elements.catalogTitle) return;

  if (search) {
    elements.catalogTitle.textContent =
      `Resultados para "${elements.searchInput.value}"`;
  } else if (activeCategory !== 'Todos') {
    elements.catalogTitle.textContent =
      activeCategory;
  } else {
    elements.catalogTitle.textContent =
      'Todos los productos';
  }

  if (elements.productCount) {
    const count = filteredProducts.length;

    elements.productCount.textContent =
      `${count} ${count === 1 ? 'producto' : 'productos'}`;
  }

  const hasProducts =
    filteredProducts.length > 0;

  elements.emptyState.hidden = hasProducts;
  elements.catalog.hidden = !hasProducts;
}

function showLoading() {
  elements.loadingState.hidden = false;
  elements.errorState.hidden = true;
  elements.emptyState.hidden = true;
  elements.catalog.hidden = true;
}

function hideLoading() {
  elements.loadingState.hidden = true;
}

function showError() {
  elements.loadingState.hidden = true;
  elements.catalog.hidden = true;
  elements.emptyState.hidden = true;
  elements.errorState.hidden = false;
}

/* =========================================================
   MODAL
========================================================= */

function openProductModal(product) {
  currentProduct = product;
  currentModalImageIndex = 0;

  renderModal(product);

  elements.modal.hidden = false;

  document.body.classList.add('modal-open');

  elements.modalClose.focus();
}

function closeProductModal() {
  elements.modal.hidden = true;
  document.body.classList.remove('modal-open');
  currentProduct = null;
}

function renderModal(product) {
  const title = getProductTitle(product);
  const category = getProductCategory(product);
  const description = cleanValue(
    product.descripcion ||
    product['descripcion breve'] ||
    product.subtitulo ||
    ''
  );

  const price = cleanValue(product.precio);

  elements.modalTitle.textContent = title;
  elements.modalCategory.textContent = category;
  elements.modalDescription.textContent = description;
  elements.modalPrice.textContent =
    price ? formatPrice(price) : '';

  renderModalDetails(product);
  renderModalGallery(product);
  updateModalFavorite();
  updateModalWhatsapp(product);
}

function renderModalDetails(product) {
  elements.modalDetails.innerHTML = '';

  const details = [
    ['Talles', product.talles || product.talle],
    ['Colores', product.colores || product.color],
    ['Marca', product.marca],
    ['Código', product.codigo || product.sku]
  ];

  details.forEach(([label, value]) => {
    const clean = cleanValue(value);

    if (!clean) return;

    const row = document.createElement('div');
    row.className = 'detail-row';

    const labelElement =
      document.createElement('span');

    labelElement.className = 'detail-label';
    labelElement.textContent = label;

    const valueElement =
      document.createElement('span');

    valueElement.className = 'detail-value';
    valueElement.textContent = clean;

    row.append(
      labelElement,
      valueElement
    );

    elements.modalDetails.appendChild(row);
  });
}

function renderModalGallery(product) {
  const images = getProductImages(product);

  elements.modalThumbnails.innerHTML = '';

  if (!images.length) {
    elements.modalImage.removeAttribute('src');
    elements.modalImage.alt = '';
    return;
  }

  setModalImage(images[0], 0, product);

  images.forEach((imageId, index) => {
    const thumbnail =
      document.createElement('button');

    thumbnail.type = 'button';
    thumbnail.className = 'modal-thumbnail';

    if (index === 0) {
      thumbnail.classList.add('active');
    }

    const thumbnailImage =
      document.createElement('img');

    thumbnailImage.src =
      getImageUrl(imageId, 180);

    thumbnailImage.alt =
      `${getProductTitle(product)} - imagen ${index + 1}`;

    thumbnailImage.loading = 'lazy';

    thumbnail.appendChild(thumbnailImage);

    thumbnail.addEventListener('click', () => {
      setModalImage(imageId, index, product);
    });

    elements.modalThumbnails.appendChild(
      thumbnail
    );
  });
}

function setModalImage(imageId, index, product) {
  currentModalImageIndex = index;

  elements.modalImage.src =
    getImageUrl(imageId, 1000);

  elements.modalImage.alt =
    getProductTitle(product);

  elements.modalImage.onerror = () => {
    if (!elements.modalImage.dataset.fallback) {
      elements.modalImage.dataset.fallback = 'true';

      elements.modalImage.src =
        buildGitHubFallbackUrl(imageId);
    }
  };

  elements.modalImage.onload = () => {
    delete elements.modalImage.dataset.fallback;
  };

  document
    .querySelectorAll('.modal-thumbnail')
    .forEach((thumbnail, thumbnailIndex) => {
      thumbnail.classList.toggle(
        'active',
        thumbnailIndex === index
      );
    });
}

function updateModalFavorite() {
  if (!currentProduct) return;

  const favorite =
    isFavorite(currentProduct._id);

  elements.modalFavorite.classList.toggle(
    'is-favorite',
    favorite
  );

  elements.modalFavorite.innerHTML = `
    <i class="${favorite
      ? 'fa-solid fa-heart'
      : 'fa-regular fa-heart'
    }"></i>
    <span>${favorite ? 'Guardado' : 'Guardar'}</span>
  `;
}

function updateModalWhatsapp(product) {
  elements.modalWhatsapp.href =
    buildWhatsAppUrl(product);
}

/* =========================================================
   EVENTOS
========================================================= */

function initEvents() {
  elements.searchInput?.addEventListener(
    'input',
    () => {
      const hasSearch =
        Boolean(
          cleanValue(
            elements.searchInput.value
          )
        );

      elements.clearSearch.hidden =
        !hasSearch;

      applyFilters();
    }
  );

  elements.clearSearch?.addEventListener(
    'click',
    () => {
      elements.searchInput.value = '';
      elements.clearSearch.hidden = true;
      elements.searchInput.focus();

      applyFilters();
    }
  );

  elements.retryBtn?.addEventListener(
    'click',
    fetchProducts
  );

  elements.modalClose?.addEventListener(
    'click',
    closeProductModal
  );

  elements.modal?.addEventListener(
    'click',
    event => {
      if (
        event.target.dataset.closeModal !== undefined
      ) {
        closeProductModal();
      }
    }
  );

  elements.modalFavorite?.addEventListener(
    'click',
    () => {
      if (!currentProduct) return;

      toggleFavorite(currentProduct._id);
      updateModalFavorite();
    }
  );

  document.addEventListener(
    'keydown',
    event => {
      if (
        event.key === 'Escape' &&
        !elements.modal.hidden
      ) {
        closeProductModal();
      }
    }
  );

  document.addEventListener(
    'keydown',
    event => {
      if (
        event.key === 'ArrowRight' &&
        currentProduct &&
        !elements.modal.hidden
      ) {
        navigateModalImage(1);
      }

      if (
        event.key === 'ArrowLeft' &&
        currentProduct &&
        !elements.modal.hidden
      ) {
        navigateModalImage(-1);
      }
    }
  );
}

function navigateModalImage(direction) {
  if (!currentProduct) return;

  const images =
    getProductImages(currentProduct);

  if (images.length <= 1) return;

  let nextIndex =
    currentModalImageIndex + direction;

  if (nextIndex < 0) {
    nextIndex = images.length - 1;
  }

  if (nextIndex >= images.length) {
    nextIndex = 0;
  }

  setModalImage(
    images[nextIndex],
    nextIndex,
    currentProduct
  );
}

/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {
    initHeaderLogo();
    initFloatingWhatsapp();
    initEvents();
    fetchProducts();
  }
);