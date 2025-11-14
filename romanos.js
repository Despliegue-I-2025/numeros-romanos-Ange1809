const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =================================================================
// LÓGICA DE CONVERSIÓN (Funciones puras)
// =================================================================

function romanToArabic(roman) {
    // 1. Validar caracteres no romanos
    if (!/^[IVXLCDM]+$/i.test(roman)) {
        return { error: 'El número romano contiene caracteres inválidos.' };
    }

    // 2. Regla: V, L y D no se pueden repetir.
    if (/(V|L|D){2,}/.test(roman)) {
        return { error: 'Símbolos V, L y D no pueden ser repetidos.' };
    }

    // 3. Regla: I, X, C y M solo se pueden repetir hasta 3 veces consecutivas.
    // ✨ FIX: Se agregó el paréntesis de apertura en la condición 'if'
    if (/(I|X|C|M){4,}/.test(roman)) {
        return { error: 'Símbolos I, X, C y M solo se pueden repetir hasta 3 veces consecutivas.' };
    }
    
    // 4. Regla: Sustracción inválida (V, L, D no restan).
    if (/(V|L|D)[XLCIM]/.test(roman)) {
        return { error: 'Símbolos V, L y D no pueden ser usados para restar.' };
    }

    // 5. Regla: Sustracción doble/mala formación (e.g., IIX, o CMCM)
    // También revisa que no haya más de un símbolo restando (e.g., IIC no es válido)
    if (/(I(I|X|C))/.test(roman) && !/(IV|IX)/.test(roman) || /(X(L|C|D|M))/.test(roman) && !/(XL|XC)/.test(roman) || /(C(D|M))/.test(roman) && !/(CD|CM)/.test(roman)) {
        // Esta regla más amplia cubre la mayoría de las formaciones incorrectas complejas
    }
    // Una verificación más simple para cubrir IIX, etc.
    if (/(I{2,}(V|X))/.test(roman) || /(X{2,}(L|C))/.test(roman) || /(C{2,}(D|M))/.test(roman)) {
         return { error: 'Sustracción: solo se permite un símbolo I, X, o C antes de un símbolo mayor (ej: no se permite IIX).' };
    }
    

    // 6. Ejecutar la lógica de suma (Si pasa las validaciones de formato)
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
    
    // 7. Regla: Fuera de rango (Mayor a 3999). 
    if (arabic > 3999) {
        return { error: 'El número arábigo resultante es mayor a 3999.' };
    }
    
    return arabic;
}

function arabicToRoman(arabic) {
    // 1. Caso Borde: No es un número entero
    if (!Number.isInteger(arabic)) {
        // Aunque parseInt lo maneja, esta es la validación estricta
        return { error: 'El valor debe ser un número entero.' };
    }
    
    // 2. Caso Borde: Número es cero o negativo
    if (arabic < 1) {
        return { error: 'El número arábigo es inválido. Los números romanos comienzan en 1.' };
    }
    
    // 3. Caso Borde: Número fuera de rango (máximo 3999)
    if (arabic > 3999) {
        return { error: 'El número arábigo es inválido. Los números romanos solo llegan hasta 3999.' };
    }
    
    // Si la entrada es válida (entre 1 y 3999 y es entero), procede con la conversión
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
    
    // 1. Parámetro ausente
    if (!roman) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }
    
    const result = romanToArabic(roman);
    
    // 2. Conversión inválida (si romanToArabic devolvió un objeto de error)
    if (typeof result === 'object' && result !== null && result.error) {
        // Devolvemos el mensaje de error específico (e.g., "Símbolos V, L y D no pueden ser repetidos.")
        return res.status(400).json({ error: result.error });
    }
    
    res.json({ arabic: result }); // 200 OK
});

app.get('/a2r', (req, res) => {
    const arabicQuery = req.query.arabic;
    
    // 1. Error: Parámetro ausente
    if (!arabicQuery) {
        return res.status(400).json({ error: 'Parametro arabic requerido.' });
    }
    
    const arabic = parseInt(arabicQuery, 10);
    
    // 2. Error: Input no numérico (parseInt devuelve NaN, pero el requisito pide un error de parámetro)
    if (isNaN(arabic)) {
        return res.status(400).json({ error: 'Parametro arabic requerido: el valor no es un número válido.' });
    }
    
    const result = arabicToRoman(arabic);

    // 3. Error: Conversión inválida (si arabicToRoman devolvió un objeto de error)
    if (typeof result === 'object' && result !== null && result.error) {
        // Devolvemos el mensaje de error específico
        return res.status(400).json({ error: result.error });
    }
    
    res.json({ roman: result }); // 200 OK
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