// 1. Importamos el módulo nativo http
const http = require("http");

// 2. Creamos el servidor
const server = http.createServer((req, res) => {
  // Escribimos la cabecera de la respuesta
  res.writeHead(200, { "Content-Type": "text/plain" });
  // Enviamos el cuerpo
  res.end("Hola mundo desde Node.js");
});

// 3. Ponemos el servidor a escuchar en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
