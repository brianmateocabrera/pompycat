const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1g5PoVD9B1d4UsVwNgFgCWRHn5L7cGo-AXzf1unaElV8/gviz/tq?tqx=out:csv';
const CLOUDINARY_CLOUD_NAME = 'tu_cloud_name';
const PHONE_NUMBER = '5491112345678';

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
        <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </button>

      <div class="card-content">
        <h3 class="card-title">${title}</h3>
        <p class="card-subtitle">${subtitle}</p>
        
        <div class="card-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
              <path d="M7 7h.01"/>
            </svg>
            ${tag}
          </span>
          <span class="meta-item font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            ${price}
          </span>
        </div>

        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn">
          Consultar
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.011 1.009c-6.07 0-10.99 4.92-10.99 10.99 0 1.94.505 3.829 1.465 5.496l-1.556 5.688 5.821-1.527c1.603.875 3.416 1.334 5.26 1.334 6.07 0 10.99-4.92 10.99-10.99 0-6.07-4.92-10.99-10.99-10.99zm6.398 15.823c-.268.756-1.332 1.391-2.176 1.574-.578.125-1.333.225-3.874-.827-3.251-1.346-5.337-4.65-5.5-4.866-.162-.216-1.318-1.753-1.318-3.344 0-1.591.834-2.373 1.13-2.696.297-.323.647-.404.863-.404.216 0 .431.002.621.011.201.009.472-.076.737.562.268.647.917 2.238.998 2.4.081.162.135.351.027.566-.108.216-.162.351-.323.54-.162.189-.341.423-.487.568-.162.162-.332.338-.143.662.189.324.841 1.388 1.803 2.245 1.238 1.103 2.28 1.444 2.604 1.606.324.162.513.135.702-.081.189-.216.81-.944 1.026-1.268.216-.324.432-.27.728-.162.297.108 1.889.89 2.213 1.052.324.162.54.243.621.378.081.135.081.783-.187 1.539z"/>
          </svg>
        </a>
      </div>
    `;
    fragment.appendChild(article);
  });

  catalog.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', fetchProducts);