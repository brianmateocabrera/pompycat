export default async function handler(req, res) {
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1DQeInDc_uG57XwjM_3SU28My1mlM5Qx6KQ5q3cZKJRk/gviz/tq?tqx=out:csv';

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('Error al obtener datos de Google Sheets');
    const csvText = await response.text();
    const products = parseCSV(csvText);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar el catálogo' });
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