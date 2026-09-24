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

function buildCloudinaryUrl(publicIdOrArt) {
  if (!publicIdOrArt) return '';
  if (publicIdOrArt.startsWith('http')) return publicIdOrArt;

  // Si no contiene extensión, asume .jpg
  let filename = publicIdOrArt;
  if (!filename.includes('.')) {
    filename += '.jpg';
  }

  // Si no incluye la ruta 'Catálogo web/', se la antepone
  let fullPath = filename;
  if (!fullPath.startsWith('Catálogo web/')) {
    fullPath = `Catálogo web/${filename}`;
  }

  // Codifica la ruta para procesar correctamente espacios y caracteres especiales
  const encodedPath = fullPath.split('/').map(encodeURIComponent).join('/');
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
    // Busca claves comunes según los posibles nombres de cabecera en tu planilla (ej: Articulo, Titulo, imagen_id, etc.)
    const rawImage = product.imagen_id || product.imagen || product.Articulo || product.articulo || '';
    const rawTitle = product.titulo || product.Titulo || product.Nombre || (product.Articulo ? `Art. ${product.Articulo}` : '');
    const rawSubtitle = product.subtitulo || product.Subtitulo || product.Descripcion || '';
    const rawTag = product.etiqueta || product.Etiqueta || product.Categoria || '';
    const rawPrice = product.precio || product.Precio || '';

    if (!rawImage && !rawTitle) return;

    const imageUrl = buildCloudinaryUrl(rawImage);
    const title = escapeHTML(rawTitle);
    const subtitle = escapeHTML(rawSubtitle);
    const tag = escapeHTML(rawTag);
    const price = escapeHTML(rawPrice);

    const waMessage = encodeURIComponent(`Hola, quiero consultar por: ${rawTitle}`);
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${waMessage}`;

    const imgTag = rawImage 
      ? `<img src="${imageUrl}" alt="${title}" class="card-bg" loading="lazy" onerror="this.style.display='none'">` 
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
          ${tag ? `<span class="meta-item"><i class="fa-solid fa-tag"></i> ${tag}</span>` : ''}
          ${price ? `<span class="meta-item font-semibold"><i class="fa-solid fa-dollar-sign"></i> ${price}</span>` : ''}
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