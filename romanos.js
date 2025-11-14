const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =================================================================
// LÓGICA DE CONVERSIÓN (Funciones puras)
// =================================================================

function romanToArabic(roman) {
    // Regex estricta para validar notación (cubre casos como IIII, VX, IM)
    const strictRomanRegex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

    if (!strictRomanRegex.test(roman)) {
        return null;
    }

    // Lógica de suma/sustracción
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
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
    
    // Revisar el rango (debe estar entre 1 y 3999)
    if (arabic < 1 || arabic > 3999) {
        return null; 
    }

    return arabic;
}

function arabicToRoman(arabic) {
  if (arabic < 1 || arabic > 3999 || !Number.isInteger(arabic)) return null;
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

// =================================================================
// html interfaz 
// =================================================================
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Conversor Romano ↔ Arábigo</title>
      </head>
      <body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>Conversor Romano ↔ Arábigo</h2>

        <h3>Romano → Arábigo</h3>
        <form action="/r2a" method="get" style="margin-bottom:20px;">
          <input type="text" name="roman" placeholder="Ej: XXIV" required />
          <button type="submit">Convertir</button>
        </form>

        <h3>Arábigo → Romano</h3>
        <form action="/a2r" method="get">
          <input type="number" name="arabic" placeholder="Ej: 2024" required min="1" max="3999" />
          <button type="submit">Convertir</button>
        </form>

        <p style="margin-top:30px;">Rango válido: 1 a 3999</p>
        <p>También puedes usar las rutas manualmente:<br>
        <code>/r2a?roman=XXIV</code> o <code>/a2r?arabic=2024</code></p>
      </body>
    </html>
  `);
});


app.get('/r2a', (req, res) => {
    // Limpiar y verificar req.query.roman dentro del endpoint
    const roman = req.query.roman ? req.query.roman.toUpperCase().trim() : null;
    
    // Corregido: 400 JSON para parámetro ausente
    if (!roman) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }
    
    const arabic = romanToArabic(roman);
    // Corregido: 400 JSON para conversión inválida
    if (arabic === null) return res.status(400).json({ error: 'Numero romano invalido.' });
    
    res.json({ arabic }); // 200 OK
});

app.get('/a2r', (req, res) => {
    const arabicQuery = req.query.arabic;
    
    if (!arabicQuery) {
        return res.status(400).json({ error: 'Parametro arabic requerido.' });
    }
    
    const arabic = parseInt(arabicQuery, 10);
    
    if (isNaN(arabic)) {
        return res.status(400).json({ error: 'Parametro arabic requerido.' });
    }
    
    const roman = arabicToRoman(arabic);
    // Corregido: 400 JSON para fuera de rango
    if (roman === null) return res.status(400).json({ error: 'Numero arabico invalido (debe ser entre 1 y 3999).' });
    
    res.json({ roman }); // 200 OK
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Roman Converter API' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =================================================================
// EXPORTAR PARA VERCEL
// =================================================================
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;
module.exports = (req, res) => app(req, res);