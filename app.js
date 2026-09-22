const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1g5PoVD9B1d4UsVwNgFgCWRHn5L7cGo-AXzf1unaElV8/gviz/tq?tqx=out:csv';
const CLOUDINARY_CLOUD_NAME = 'qlugtd3x';
const PHONE_NUMBER = '5493518189444';
const LOGO_PUBLIC_ID = 'logo-pompy-durazno';

function initHeaderLogo() {
  const logoImg = document.getElementById('header-logo');
  if (logoImg) {
    logoImg.src = buildCloudinaryUrl(LOGO_PUBLIC_ID);
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('Error');
    const data = await response.text();
    const rows = parseCSV(data);
    renderCatalog(rows);
  } catch (error) {
    console.error(error);
  }
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const values = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));
    return values;
  };

  const headers = parseLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseLine(line);
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : '';
      return obj;
    }, {});
  });
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

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <img src="${imageUrl}" alt="${title}" class="card-bg" loading="lazy">
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