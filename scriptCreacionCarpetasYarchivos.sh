Estos comandos son para crear todos las carpetas y archivos desde la terminal, buscando ahorrar tiempo y volverse mas efiente en la nabegacion desde la terminal.

1. Primeros pasos para la creacion de carpetas desde la terminal.
mkdir catalogo-netflix
cd catalogo-netflix
mkdir data mkdir cd data

2.Creacion de archivos txt desde la terminal. 

cd data
echo "2001 Odisea en el espacio, Stanley Kubrick, 1968" > peliculas.txt
echo "The Matrix, Lilly Wachowski Lana Wachowski, 1999" >> peliculas.txt
echo "Black Mirror, 2011, 5" > series.txt
echo "La casa de papel, 2017, 2" >> series.txt
cd ..

3.Creacion de archivos servidor desde la terminal 

New-Item server.js

4. Creacion de Carpetas secundarias desde la terminal 
New-Item -ItemType Directory -Path public\css, public\js -Force

5. Creacion de Archivos 
    1.New-Item -ItemType File -Path public\index.html, public\css\style.css, public\js\app.js -Force
    2.New-Item -ItemType File -Path index.html, css\style.css, js\app.js -Force (Dentro de carpeta public)