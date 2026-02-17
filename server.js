// 1. IMPORTAR MÓDULOS NATIVOS
const http = require("http");
const url = require("url");
const fs = require("fs").promises;
const path = require("path");

// 2. CONSTANTES (rutas de archivos)
const DATA_DIR = path.join(__dirname, "data");
const PELICULAS_FILE = path.join(DATA_DIR, "peliculas.txt");
const SERIES_FILE = path.join(DATA_DIR, "series.txt");

// 3. FUNCIONES AUXILIARES (las iremos añadiendo)
async function leerArchivo(tipo) {
    const filePath = tipo === "peliculas" ? PELICULAS_FILE : SERIES_FILE;
    try {
        const data = await fs.readFile(filePath, "utf-8");
        const lineas = data.split("\n").filter((linea) => linea.trim() !== "");

        const items = lineas.map((linea) => {
            const campos = linea.split(",").map((c) => c.trim());
            if (tipo === "peliculas") {
                return {
                    nombre: campos[0],
                    director: campos[1],
                    año: parseInt(campos[2]),
                };
            } else {
                return {
                    nombre: campos[0],
                    año: parseInt(campos[1]),
                    temporadas: parseInt(campos[2]),
                };
            }
        });

        return items;
    } catch (error) {
        if (error.code === "ENOENT") {
            return []; // Si el archivo no existe, devolvemos lista vacía
        }
        throw error; // Otro error sí lo lanzamos
    }
}

// 4. CREAR EL SERVIDOR
const server = http.createServer(async (req, res) => {
    // Cabeceras comunes
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Para DELETE y POST, también necesitamos permitir métodos
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Manejar preflight OPTIONS (lo veremos después)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Parsear URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // --- ENRUTAMIENTO ---
    if (pathname === '/catalogo') {
        if (req.method === 'GET') {
            // Validar parámetro tipo
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
        } else {
            // Por ahora, otros métodos darán 405
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Método no permitido' }));
        }
    }
});

// 5. PONER EL SERVIDOR A ESCUCHAR
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
