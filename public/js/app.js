// URL de nuestra API
const API_URL = 'http://localhost:3000/catalogo';

// Elementos del DOM (añadimos los del navbar)
const btnPeliculas = document.getElementById('btnPeliculas');
const btnSeries = document.getElementById('btnSeries');
const navPeliculas = document.getElementById('navPeliculas');
const navSeries = document.getElementById('navSeries');
const selectOrden = document.getElementById('orden');
const tablaBody = document.getElementById('tablaBody');
const opcionDirector = document.getElementById('opcionDirector');
const opcionTemporadas = document.getElementById('opcionTemporadas');
const formPelicula = document.getElementById('formPelicula');
const formSerie = document.getElementById('formSerie');

// Variables de estado
let tipoActual = 'peliculas';
let datosActuales = [];

// ==============================================
// FUNCIONES AUXILIARES (igual que antes)
// ==============================================

function mostrarAlerta(mensaje, tipo = 'success') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alerta.style.zIndex = '9999';
    alerta.style.maxWidth = '400px';
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

async function cargarDatos(tipo) {
    try {
        const response = await fetch(`${API_URL}?tipo=${tipo}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos');
        }
        
        const data = await response.json();
        datosActuales = data;
        mostrarTabla(data, tipo);
        
        opcionDirector.disabled = (tipo !== 'peliculas');
        opcionTemporadas.disabled = (tipo !== 'series');
        
        if (data.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        No hay ${tipo === 'peliculas' ? 'películas' : 'series'} para mostrar
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Error al cargar los datos', 'danger');
    }
}

function mostrarTabla(items, tipo) {
    if (items.length === 0) return;
    
    tablaBody.innerHTML = '';
    
    items.forEach(item => {
        const fila = document.createElement('tr');
        
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = item.nombre;
        fila.appendChild(celdaNombre);
        
        const celda2 = document.createElement('td');
        celda2.textContent = tipo === 'peliculas' ? item.director : item.año;
        fila.appendChild(celda2);
        
        const celda3 = document.createElement('td');
        celda3.textContent = tipo === 'peliculas' ? item.año : item.temporadas;
        fila.appendChild(celda3);
        
        tablaBody.appendChild(fila);
    });
}

function ordenarDatos(criterio) {
    if (!datosActuales.length) return;
    
    const datosOrdenados = [...datosActuales];
    
    if (criterio === 'nombre') {
        datosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterio === 'año') {
        datosOrdenados.sort((a, b) => a.año - b.año);
    } else if (criterio === 'director' && tipoActual === 'peliculas') {
        datosOrdenados.sort((a, b) => a.director.localeCompare(b.director));
    } else if (criterio === 'temporadas' && tipoActual === 'series') {
        datosOrdenados.sort((a, b) => a.temporadas - b.temporadas);
    }
    
    mostrarTabla(datosOrdenados, tipoActual);
}

// ==============================================
// EVENTOS (incluyendo navbar)
// ==============================================

// Botones principales
btnPeliculas.addEventListener('click', () => {
    tipoActual = 'peliculas';
    cargarDatos('peliculas');
});

btnSeries.addEventListener('click', () => {
    tipoActual = 'series';
    cargarDatos('series');
});

// Enlaces del navbar
navPeliculas.addEventListener('click', (e) => {
    e.preventDefault();
    tipoActual = 'peliculas';
    cargarDatos('peliculas');
});

navSeries.addEventListener('click', (e) => {
    e.preventDefault();
    tipoActual = 'series';
    cargarDatos('series');
});

selectOrden.addEventListener('change', (e) => {
    ordenarDatos(e.target.value);
});

// Formularios (igual que antes)
formPelicula.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevaPelicula = {
        tipo: 'pelicula',
        nombre: document.getElementById('peliculaNombre').value,
        director: document.getElementById('peliculaDirector').value,
        año: parseInt(document.getElementById('peliculaAnio').value)
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaPelicula)
        });
        
        if (response.ok) {
            mostrarAlerta('Película agregada correctamente');
            formPelicula.reset();
            if (tipoActual === 'peliculas') {
                cargarDatos('peliculas');
            }
        } else {
            const error = await response.json();
            mostrarAlerta(`Error: ${error.error}`, 'danger');
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    }
});

formSerie.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevaSerie = {
        tipo: 'serie',
        nombre: document.getElementById('serieNombre').value,
        año: parseInt(document.getElementById('serieAnio').value),
        temporadas: parseInt(document.getElementById('serieTemporadas').value)
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaSerie)
        });
        
        if (response.ok) {
            mostrarAlerta('Serie agregada correctamente');
            formSerie.reset();
            if (tipoActual === 'series') {
                cargarDatos('series');
            }
        } else {
            const error = await response.json();
            mostrarAlerta(`Error: ${error.error}`, 'danger');
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    }
});