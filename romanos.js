const express = require('express');
const app = express();

// =====================================================
// LÓGICA DE CONVERSIÓN
// =====================================================
function romanToArabic(roman) {
  if (!roman || typeof roman !== 'string') return null;
  roman = roman.toUpperCase().trim();

  if (!/^[IVXLCDM]+$/.test(roman)) return null;

  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const invalidRepeats = /(IIII|VV|XXXX|LL|CCCC|DD|MMMM)/;
  if (invalidRepeats.test(roman)) return null;

  let arabic = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i]];
    const next = map[roman[i + 1]];
    if (next > current) {
      arabic += next - current;
      i++;
    } else {
      arabic += current;
    }
  }

  if (arabic < 1 || arabic > 3999) return null;
  return arabic;
}

function arabicToRoman(arabic) {
  if (
    typeof arabic !== 'number' ||
    isNaN(arabic) ||
    !Number.isInteger(arabic) ||
    arabic < 1 ||
    arabic > 3999
  ) {
    return null;
  }

  const numerals = [
    { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' },
    { v: 400, s: 'CD' }, { v: 100, s: 'C' }, { v: 90, s: 'XC' },
    { v: 50, s: 'L' }, { v: 40, s: 'XL' }, { v: 10, s: 'X' },
    { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' }, { v: 1, s: 'I' }
  ];

  let roman = '';
  for (const { v, s } of numerals) {
    while (arabic >= v) {
      roman += s;
      arabic -= v;
    }
  }
  return roman;
}

// =====================================================
// ENDPOINTS EXPRESS
// =====================================================

// Página principal informativa
app.get('/', (req, res) => {
  res.send(`
    <html><head><meta charset="utf-8" /><title>Conversor Romano ↔ Arábigo</title></head>
    <body style="font-family:sans-serif;text-align:center;padding:40px;">
      <h2>Conversor Romano ↔ Arábigo</h2>
      <p>Usa las rutas <b>/r2a?roman=XXIV</b> o <b>/a2r?arabic=2024</b></p>
      <p>Rango válido: 1 a 3999</p>
    </body></html>
  `);
});

// Romano → Arábigo
app.get('/r2a', (req, res) => {
  const roman = req.query.roman ? req.query.roman.toUpperCase() : null;
  if (!roman) {
    return res.status(400).json({ error: 'Parametro roman requerido.' });
  }

  const arabic = romanToArabic(roman);
  if (arabic === null) {
    return res.status(400).json({ error: 'Numero romano invalido.' });
  }

  return res.json({ arabic });
});

// Arábigo → Romano
app.get('/a2r', (req, res) => {
  const arabic = parseFloat(req.query.arabic);
  if (isNaN(arabic)) {
    return res.status(400).json({ error: 'Parametro arabic requerido.' });
  }

  if (!Number.isInteger(arabic)) {
    return res.status(400).json({ error: 'Numero arabico invalido (debe ser entre 1 y 3999).' });
  }

  const roman = arabicToRoman(arabic);
  if (roman === null) {
    return res.status(400).json({ error: 'Numero arabico invalido (debe ser entre 1 y 3999).' });
  }

  return res.json({ roman });
});

// Salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Roman Converter API' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =====================================================
// EXPORTAR PARA TESTS Y VERCEL
// =====================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
}

module.exports = { app, romanToArabic, arabicToRoman };
