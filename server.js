// 1. IMPORTAR MÓDULOS NATIVOS
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

// 2. CONSTANTES CON RUTAS DE ARCHIVOS
const DATA_DIR = path.join(__dirname, 'data');
const PELICULAS_FILE = path.join(DATA_DIR, 'peliculas.txt');
const SERIES_FILE = path.join(DATA_DIR, 'series.txt');

// 3. FUNCIONES AUXILIARES (manejo de archivos)

// Lee el archivo (peliculas o series) y devuelve un array de objetos
async function leerArchivo(tipo) {
  const filePath = tipo === 'peliculas' ? PELICULAS_FILE : SERIES_FILE;

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const lineas = data.split('\n').filter(linea => linea.trim() !== '');

    const items = lineas.map(linea => {
      const campos = linea.split(',').map(c => c.trim());
      if (tipo === 'peliculas') {
        return {
          nombre: campos[0],
          director: campos[1],
          año: parseInt(campos[2])
        };
      } else {
        return {
          nombre: campos[0],
          año: parseInt(campos[1]),
          temporadas: parseInt(campos[2])
        };
      }
    });

    return items;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Agrega una nueva línea al archivo correspondiente
async function agregarLinea(tipo, nuevoItem) {
  const filePath = tipo === 'peliculas' ? PELICULAS_FILE : SERIES_FILE;

  let linea;
  if (tipo === 'peliculas') {
    linea = `${nuevoItem.nombre}, ${nuevoItem.director}, ${nuevoItem.año}\n`;
  } else {
    linea = `${nuevoItem.nombre}, ${nuevoItem.año}, ${nuevoItem.temporadas}\n`;
  }

  await fs.appendFile(filePath, linea, 'utf-8');
}

// Elimina una línea que coincida con el nombre (primer campo)
async function eliminarLinea(tipo, nombre) {
  const filePath = tipo === 'peliculas' ? PELICULAS_FILE : SERIES_FILE;

  const data = await fs.readFile(filePath, 'utf-8');
  const lineas = data.split('\n').filter(linea => linea.trim() !== '');

  const nuevasLineas = lineas.filter(linea => {
    const primerCampo = linea.split(',')[0].trim();
    return primerCampo !== nombre;
  });

  if (nuevasLineas.length === lineas.length) {
    const error = new Error('Elemento no encontrado');
    error.status = 404;
    throw error;
  }

  await fs.writeFile(filePath, nuevasLineas.join('\n') + (nuevasLineas.length ? '\n' : ''), 'utf-8');
}

// FUNCIÓN PARA SERVIR ARCHIVOS ESTÁTICOS (NUEVA)
async function servirArchivoEstatico(rutaRelativa, res) {
  const filePath = path.join(__dirname, 'public', rutaRelativa);
  
  try {
    const data = await fs.readFile(filePath);
    
    // Determinar el tipo MIME según la extensión
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    // Archivo no encontrado
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

// 4. CREAR EL SERVIDOR
const server = http.createServer(async (req, res) => {
  // Cabeceras comunes para todas las respuestas
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar peticiones OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parsear la URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // --- ENRUTAMIENTO ---
  if (pathname === '/catalogo') {
    // ====================
    // MÉTODO GET
    // ====================
    if (req.method === 'GET') {
      if (!query.tipo || (query.tipo !== 'peliculas' && query.tipo !== 'series')) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Parámetro "tipo" requerido: peliculas o series' }));
        return;
      }

      try {
        const items = await leerArchivo(query.tipo);
        res.statusCode = 200;
        res.end(JSON.stringify(items));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error interno del servidor' }));
      }
    }
    // ====================
    // MÉTODO POST
    // ====================
    else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const nuevoItem = JSON.parse(body);

          if (!nuevoItem.tipo || (nuevoItem.tipo !== 'pelicula' && nuevoItem.tipo !== 'serie')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'El campo "tipo" debe ser "pelicula" o "serie"' }));
            return;
          }

          if (nuevoItem.tipo === 'pelicula') {
            if (!nuevoItem.nombre || !nuevoItem.director || !nuevoItem.año) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Faltan campos: nombre, director, año' }));
              return;
            }
          } else {
            if (!nuevoItem.nombre || !nuevoItem.año || !nuevoItem.temporadas) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Faltan campos: nombre, año, temporadas' }));
              return;
            }
          }

          await agregarLinea(nuevoItem.tipo === 'pelicula' ? 'peliculas' : 'series', nuevoItem);

          res.statusCode = 201;
          res.end(JSON.stringify({ mensaje: 'Elemento agregado correctamente' }));
        } catch (error) {
          if (error instanceof SyntaxError) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'JSON inválido' }));
          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Error interno del servidor' }));
          }
        }
      });
    }
    // ====================
    // MÉTODO DELETE
    // ====================
    else if (req.method === 'DELETE') {
      if (!query.tipo || (query.tipo !== 'pelicula' && query.tipo !== 'serie')) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Parámetro "tipo" requerido: pelicula o serie' }));
        return;
      }

      if (!query.nombre) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Parámetro "nombre" requerido' }));
        return;
      }

      try {
        const nombreDecodificado = decodeURIComponent(query.nombre);
        await eliminarLinea(query.tipo === 'pelicula' ? 'peliculas' : 'series', nombreDecodificado);

        res.statusCode = 200;
        res.end(JSON.stringify({ mensaje: 'Elemento eliminado correctamente' }));
      } catch (error) {
        if (error.status === 404) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Elemento no encontrado' }));
        } else {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Error interno del servidor' }));
        }
      }
    }
    // ====================
    // MÉTODO NO PERMITIDO
    // ====================
    else {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Método no permitido' }));
    }
  } else {
    // ====================
    // SERVIR ARCHIVOS ESTÁTICOS (MODIFICADO)
    // ====================
    // Si la ruta es raíz, servimos index.html
    let rutaArchivo = pathname === '/' ? '/index.html' : pathname;
    await servirArchivoEstatico(rutaArchivo, res);
  }
});

// 5. PONER EL SERVIDOR A ESCUCHAR
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});