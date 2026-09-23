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
const LOGO_PUBLIC_ID = 'logo-pompy-durazno.jpg';
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
    console.error(error);
  }
}

function buildCloudinaryUrl(imageName) {
  if (!imageName) return '';
  if (imageName.startsWith('http')) return imageName;
  
  const cleanName = imageName.replace(/\.[^/.]+$/, '');
  const publicPath = `${CLOUDINARY_FOLDER}/${cleanName}`;
  const encodedPath = encodeURIComponent(publicPath).replace(/%2F/g, '/');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${encodedPath}`;
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
    const isVisible = String(product.visible).toUpperCase() === 'TRUE';
    if (!isVisible) return;

    const productId = product.id || '';
    const brandText = product.marca || '';
    const modelText = product.modelo || '';
    const subtitleText = product['descripcion breve'] || '';
    const rawPrice = product.precio || '';
    const rawOldPrice = product['precio tachado'] || '';
    const rawImage = product.imagen1 || '';

    const imageUrl = buildCloudinaryUrl(rawImage);
    const brand = escapeHTML(brandText);
    const model = escapeHTML(modelText);
    const subtitle = escapeHTML(subtitleText);
    const price = escapeHTML(rawPrice ? `$${rawPrice}` : '');
    const oldPrice = escapeHTML(rawOldPrice ? `$${rawOldPrice}` : '');

    const waText = `Hola, quiero consultar por el producto ${productId ? `(${productId}) ` : ''}${modelText}`;
    const waMessage = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${waMessage}`;

    const imgTag = rawImage 
      ? `<img src="${imageUrl}" alt="${model}" class="card-bg" loading="lazy">` 
      : '';

    const priceHTML = oldPrice 
      ? `<span class="price-old">${oldPrice}</span><span>${price}</span>` 
      : `<span>${price}</span>`;

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      ${imgTag}
      <div class="card-overlay"></div>

      <button class="favorite-btn" aria-label="Guardar en favoritos">
        <i class="fa-regular fa-heart heart-icon"></i>
      </button>

      <div class="card-content">
        <h3 class="card-title">${model}</h3>
        <p class="card-subtitle">${subtitle}</p>
        
        <div class="card-meta">
          <span class="meta-item">
            <i class="fa-solid fa-tag"></i>
            ${brand}
          </span>
          <span class="meta-item font-semibold">
            <i class="fa-solid fa-dollar-sign"></i>
            ${priceHTML}
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