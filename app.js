/*
const CLOUDINARY_CLOUD_NAME = 'qlugtd3x';
const PHONE_NUMBER = '5493518189444';
const LOGO_PUBLIC_ID = 'logo.jpeg';

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
    console.error(error);
  }
}

function buildCloudinaryUrl(publicId) {
  if (!publicId) return '';
  if (publicId.startsWith('http')) return publicId;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${publicId}`;
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
  catalog.innerHTML = '';

  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    if (!product.imagen_id && !product.titulo) return;

    const imageUrl = buildCloudinaryUrl(product.imagen_id);
    const title = escapeHTML(product.titulo);
    const subtitle = escapeHTML(product.subtitulo);
    const tag = escapeHTML(product.etiqueta);
    const price = escapeHTML(product.precio);

    const waMessage = encodeURIComponent(`Hola, quiero consultar por: ${product.titulo}`);
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${waMessage}`;

    const imgTag = product.imagen_id 
      ? `<img src="${imageUrl}" alt="${title}" class="card-bg" loading="lazy">` 
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
const CLOUDINARY_FOLDER = 'Catálogo web';

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
  if (publicId.startsWith('http')) return publicId;

  // Limpiar/Asegurar nombre de carpeta sin codificación excesiva
  const cleanFolder = 'Catálogo web';
  const cleanId = publicId.startsWith(`${cleanFolder}/`) 
    ? publicId 
    : `${cleanFolder}/${publicId}`;

  // Si el publicId no termina con extensión explícita, forzamos la entrega en formato auto o jpg
  const hasExtension = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(cleanId);
  const finalPath = hasExtension ? cleanId : `${cleanId}.jpg`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${encodeURI(finalPath)}`;
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
    const title = escapeHTML(rawTitle);
    const subtitle = escapeHTML(rawSubtitle);
    const tag = escapeHTML(rawCategory);
    const price = escapeHTML(rawPrice);

    const waMessage = encodeURIComponent(`Hola, quiero consultar por: ${rawTitle}`);
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${waMessage}`;

    const imgTag = rawImg 
      ? `<img src="${imageUrl}" alt="${title}" class="card-bg" loading="lazy">` 
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