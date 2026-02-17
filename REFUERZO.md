# REFUERZO SERVIDOR WEB NODEJS

### Este documento es una guia de estudio para tener en cuenta, busca que entienda cada parte del servidor y que funcione.

1. IMPORTAR MÓDULOS NECESARIOS
2. DEFINIR CONSTANTES (rutas, puertos, etc.)
3. FUNCIONES AUXILIARES (lógica de negocio, acceso a datos, etc.)
4. CREAR EL SERVIDOR (http.createServer)
5. DENTRO DEL SERVIDOR: MANEJADOR DE PETICIONES (req, res)
   5.1. Parsear la URL y método
   5.2. Rutas (if/else o switch)
   5.3. Para cada ruta: implementar métodos HTTP (GET, POST, DELETE...)
   5.4. Enviar respuesta (con cabeceras y cuerpo)
6. PONER EL SERVIDOR A ESCUCHAR EN UN PUERTO
   
## Explicación de cada bloque

1. Importaciones
Siempre necesitas http para crear el servidor. Luego añades otros módulos según lo que hagas: fs para archivos, path para rutas, url para parsear, etc.
Pregúntate: ¿Voy a leer/escribir archivos? → fs. ¿Voy a manejar rutas de archivos? → path. ¿Voy a recibir parámetros en la URL? → url (casi siempre sí).

2. Constantes
Pon aquí valores fijos: puerto, rutas de carpetas, nombres de archivos, etc. Así si cambian, solo modificas aquí.

3. Funciones auxiliares
Extrae la lógica de negocio fuera del manejador de peticiones. Esto hace el código más legible y reutilizable. Por ejemplo, en tu caso: leerArchivo, agregarLinea, eliminarLinea.
Regla: Si una operación no depende directamente de req o res, debe estar en una función aparte.

4. Crear servidor
http.createServer recibe un callback que se ejecuta en cada petición. Ese callback es el corazón.

5. Parsear la petición
Siempre necesitas saber:

URL (pathname y query) con url.parse.

Método HTTP (GET, POST, etc.) con req.method.

A veces el cuerpo (body) en POST/PUT.

6. Ruteo
Aquí decides qué hacer según el path. Puedes usar if/else if o un switch. Para cada ruta, vuelves a preguntar por el método y actúas en consecuencia.

7. Archivos estáticos (opcional)
Si tu servidor también debe servir HTML, CSS, JS, etc., añades un bloque final que intente servir esos archivos desde una carpeta (normalmente public). Si no encuentras el archivo, devuelves 404.

8. Iniciar servidor
server.listen con el puerto y un mensaje de confirmación.

¿Esta estructura es universal?

Sí, para servidores HTTP hechos con Node.js puro.
Si usas Express, la estructura es similar pero más compacta (con app.get, app.post, etc.).
Si haces un servidor TCP (no HTTP), cambiaría bastante, pero para aplicaciones web siempre es así.

## Hoja de ruta mental para no quedarte en blanco
Cuando te enfrentes a un nuevo ejercicio, pregúntate en orden:

1. ¿Qué módulos voy a necesitar? (http siempre, fs si hay archivos, path si hay rutas, url siempre para query params)

2. ¿Dónde voy a guardar los datos? (archivos, memoria, etc.) → define constantes de rutas.

3. ¿Qué operaciones de negocio necesito? (leer, agregar, eliminar, actualizar) → crea funciones para cada una.

4. ¿Qué rutas (endpoints) va a tener mi API? (ej. /catalogo, /usuarios, etc.)

5. Para cada ruta, ¿qué métodos HTTP voy a permitir? (GET, POST, DELETE...)

6. ¿Qué parámetros espera cada método? (query string, body, URL params)

7. ¿Qué respuestas voy a dar? (códigos de estado, formato JSON, etc.)