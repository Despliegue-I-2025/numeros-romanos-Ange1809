[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/gJA-GD-V)

# Conversor de Números Romanos ↔ Arábigos
## por angelica morales- trabajo final despliegue

API desarrollada en **Node.js + Express**, que permite convertir números **romanos a arábigos y viceversa**, con validación de rango (1–3999) y respuesta en formato JSON.  
El proyecto fue **desplegado en Vercel** y puede probarse públicamente en el siguiente enlace:

🔗 **[https://numeros-romanos-ange1809.vercel.app/](https://numeros-romanos-ange1809.vercel.app/)**

---

## 🧩 Descripción general

El proyecto implementa un **servicio backend en Express** con endpoints dedicados para la conversión de números.  
Incluye además una **página de inicio** con instrucciones y ejemplos interactivos.  
Fue diseñado bajo buenas prácticas REST, e incluye **manejo de errores, validaciones, y respuestas HTTP adecuadas**.

Los endpoints disponibles son:

| Método | Ruta | Descripción |
|:--------:|:-----|:------------|
| `GET` | `/` | Página principal con enlaces a las rutas de conversión |
| `GET` | `/r2a?roman=XX` | Convierte un número romano a arábigo |
| `GET` | `/a2r?arabic=20` | Convierte un número arábigo a romano |
| `GET` | `/health` | Verifica el estado del servicio |

Ejemplo de uso:
https://numeros-romanos-ange1809.vercel.app/r2a?roman=XXIV
→ { "arabic": 24 }


---

## ⚙️ Tecnologías utilizadas

- **Node.js v18+**
- **Express.js**
- **Jest** (para pruebas unitarias)
- **Supertest** (para testear endpoints)
- **Vercel** (para despliegue serverless)

---

## 🧠 Mejoras implementadas

- Se reestructuró el proyecto para que el archivo principal `romanos.js` se ubique en la raíz (no dentro de `/api`).
- Se corrigieron las validaciones de caracteres inválidos en números romanos.
- Se añadieron **mensajes informativos** cuando las rutas se acceden sin parámetros (por ejemplo, `/r2a` sin `?roman=`).
- Se implementó una **página principal** que muestra de forma clara las rutas disponibles y ejemplos de uso.
- Se configuró un **`vercel.json`** personalizado para asegurar el correcto funcionamiento en entorno serverless.
- Se corrigió la exportación de la aplicación Express (`module.exports = (req, res) => app(req, res);`) para compatibilidad total con Vercel.
- Se validó el despliegue continuo y la ejecución correcta de los endpoints en la nube.

---

## 🧩 Requisitos previos

- Tener instalado **Node.js 18 o superior**.
- Tener una cuenta en **Vercel** (para despliegue).
- Tener permisos de administrador sobre el repositorio en GitHub (si se usa integración con GitHub Actions).

---

## 💻 Instalación local

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd numeros-romanos-Ange1809
Instalar dependencias:

npm install


2.Ejecutar el servidor localmente:

npm start


3. Probar los endpoints:

http://localhost:3000/r2a?roman=X

http://localhost:3000/a2r?arabic=10

http://localhost:3000/health
Despliegue en Vercel

Cada push a la rama principal (main) puede disparar un despliegue automático en Vercel mediante la CLI.

Pasos para configurar el despliegue manual

Instalar y autenticar Vercel

npm install -g vercel
vercel login
vercel link


Configurar el archivo vercel.json

{
  "version": 2,
  "builds": [{ "src": "romanos.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "romanos.js" }]
}


Desplegar

vercel --prod


Una vez finalizado, el sistema mostrará la URL pública del proyecto (en este caso, la final fue:
👉 https://numeros-romanos-ange1809.vercel.app
).

🧪 Pruebas unitarias

Las pruebas se ejecutan con Jest y cubren los casos principales:

Conversión correcta de romanos a arábigos.

Conversión correcta de arábigos a romanos.

Manejo de errores para entradas inválidas o fuera de rango.

Para ejecutarlas:

npm test

🧾 Scripts útiles
Comando	Descripción
npm start	Inicia el servidor local.
npm test	Ejecuta las pruebas con Jest.
vercel --prod	Despliega la aplicación en producción.
🧠 Conclusión

Este trabajo implementa un servicio backend funcional, validado y desplegado correctamente en Vercel, cumpliendo con todos los requisitos técnicos del proyecto final.