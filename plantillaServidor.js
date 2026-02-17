// ============================================
// 1. IMPORTAR MÓDULOS NATIVOS
// ============================================
const http = require('http');
const fs = require('fs').promises;   // si vas a leer/escribir archivos
const path = require('path');        // si necesitas rutas
const url = require('url');          // siempre para parsear la URL

// ============================================
// 2. CONSTANTES GLOBALES
// ============================================
const PORT = 3000;                   // Puerto donde escuchará
const DATA_DIR = path.join(__dirname, 'data');   // Ejemplo: carpeta de datos

// ============================================
// 3. FUNCIONES AUXILIARES (lógica de negocio)
// ============================================
// Aquí van funciones que:
//   - Leen/escriben archivos
//   - Validan datos
//   - Transforman formatos
//   - Cualquier operación que no sea directamente responder HTTP
//
// Ejemplo (vacío):
async function leerDatos(tipo) {
    // ...
}

async function guardarDatos(tipo, datos) {
    // ...
}

async function eliminarDatos(tipo, id) {
    // ...
}

// ============================================
// 4. CREAR EL SERVIDOR
// ============================================
const server = http.createServer(async (req, res) => {
    // ========================================
    // 5. PARSEAR LA PETICIÓN
    // ========================================
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const method = req.method;

    // Configurar cabeceras comunes (CORS, content-type por defecto)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Nota: el content-type puede cambiar según la respuesta, así que a veces se pone después

    // ========================================
    // 6. RUTEO (definir las rutas que aceptamos)
    // ========================================
    if (pathname === '/') {
        // Ruta raíz: normalmente sirve un HTML o un mensaje
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Bienvenido</h1>');
    }
    else if (pathname === '/api/datos') {
        // ------------------------------
        // GET /api/datos
        // ------------------------------
        if (method === 'GET') {
            // Verificar parámetros, si los hay
            if (!query.tipo) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Falta parámetro tipo' }));
                return;
            }
            try {
                const datos = await leerDatos(query.tipo);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(datos));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error interno' }));
            }
        }
        // ------------------------------
        // POST /api/datos
        // ------------------------------
        else if (method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const nuevo = JSON.parse(body);
                    // Validar nuevo...
                    await guardarDatos(nuevo.tipo, nuevo);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ mensaje: 'Creado' }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Datos inválidos' }));
                }
            });
        }
        // ------------------------------
        // DELETE /api/datos
        // ------------------------------
        else if (method === 'DELETE') {
            if (!query.id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Falta id' }));
                return;
            }
            try {
                await eliminarDatos(query.tipo, query.id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ mensaje: 'Eliminado' }));
            } catch (error) {
                if (error.message === 'No encontrado') {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No encontrado' }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error interno' }));
                }
            }
        }
        // ------------------------------
        // Método no permitido en esta ruta
        // ------------------------------
        else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Método no permitido' }));
        }
    }
    // ========================================
    // 7. RUTA PARA ARCHIVOS ESTÁTICOS (opcional)
    // ========================================
    else {
        // Si no es una ruta de API, intentamos servir un archivo estático
        // (ej. desde una carpeta 'public')
        const filePath = path.join(__dirname, 'public', pathname);
        // ... lógica para servir el archivo o devolver 404
    }
});

// ============================================
// 8. INICIAR EL SERVIDOR
// ============================================
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});