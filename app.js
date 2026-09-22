const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1g5PoVD9B1d4UsVwNgFgCWRHn5L7cGo-AXzf1unaElV8/gviz/tq?tqx=out:csv';

async function fetchProducts() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const data = await response.text();
    const rows = parseCSV(data);
    renderCatalog(rows);
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

// Parser CSV robusto tolerante a comillas y comas internas
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
      obj[header] = values[index] || '';
      return obj;
    }, {});
  });
}

function renderCatalog(products) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  products.forEach(product => {
    // Si no hay imagen en la fila, omite la renderización parcial
    if (!product.imagen_id && !product.titulo) return;

    const imageUrl = `https://lh3.googleusercontent.com/d/${product.imagen_id.trim()}`;

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <img src="${imageUrl}" alt="${product.titulo}" class="card-bg">
      <div class="card-overlay"></div>

      <button class="favorite-btn" aria-label="Guardar en favoritos">
        <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </button>

      <div class="card-content">
        <h3 class="card-title">${product.titulo}</h3>
        <p class="card-subtitle">${product.subtitulo}</p>
        
        <div class="card-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
              <path d="M7 7h.01"/>
            </svg>
            ${product.etiqueta} 
          </span>
          <span class="meta-item font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>   
            ${product.precio}
          </span>
        </div>

        <button class="cta-btn" onclick="window.open('https://wa.me/?text=Hola,%20busco%20info%20del%20${encodeURIComponent(product.titulo)}', '_blank')">Consultame</button>
      </div>
    `;
    catalog.appendChild(article);
  });
}

document.addEventListener('DOMContentLoaded', fetchProducts);