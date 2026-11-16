// Data inicial de telemetría del servidor
const historialServidor = [
  { modulosCargados: ["auth", "perfil"], caidaSistema: false },
  { modulosCargados: ["auth", "pagos", "reportes"], caidaSistema: true },
  { modulosCargados: ["perfil", "pagos"], caidaSistema: true },
  { modulosCargados: ["auth", "perfil"], caidaSistema: false },
  { modulosCargados: ["pagos", "notificaciones"], caidaSistema: true },
  { modulosCargados: ["auth", "notificaciones"], caidaSistema: false }
];

// ==========================================
// FUNCIONES REQUERIDAS POR EL ENUNCIADO
// ==========================================

// 1. Registrar Sesión utilizando notación abreviada de propiedades
function registrarSesion(historial, modulos, huboCaida) {
  const modulosCargados = modulos;
  const caidaSistema = huboCaida;

  // Notación abreviada de propiedades (Property Shorthand)
  historial.push({ modulosCargados, caidaSistema });
}

// 2. Obtener lista de módulos únicos sin repetir
function obtenerModulosUnicos(historial) {
  const modulosUnicos = [];

  for (const sesion of historial) {
    for (const modulo of sesion.modulosCargados) {
      if (!modulosUnicos.includes(modulo)) {
        modulosUnicos.push(modulo);
      }
    }
  }

  return modulosUnicos;
}

// 3. Diagnosticar Módulo (Construcción de Tabla 2x2)
function diagnosticarModulo(historial, nombreModulo) {
  let sinModuloSinCaida = 0;
  let conModuloSinCaida = 0;
  let sinModuloConCaida = 0;
  let conModuloConCaida = 0;

  for (const sesion of historial) {
    const tieneModulo = sesion.modulosCargados.includes(nombreModulo);
    const caida = sesion.caidaSistema;

    if (!tieneModulo && !caida) {
      sinModuloSinCaida++;
    } else if (tieneModulo && !caida) {
      conModuloSinCaida++;
    } else if (!tieneModulo && caida) {
      sinModuloConCaida++;
    } else if (tieneModulo && caida) {
      conModuloConCaida++;
    }
  }

  return {
    sinModuloSinCaida,
    conModuloSinCaida,
    sinModuloConCaida,
    conModuloConCaida
  };
}

// ==========================================
// INTERACCIÓN CON EL DOM Y LA INTERFAZ WEB
// ==========================================

const formSesion = document.getElementById("formSesion");
const selectModulosMulti = document.getElementById("modulosSelect");
const inputCaida = document.getElementById("caidaInput");

const selectModulo = document.getElementById("selectModulo");
const contenedorModulosUnicos = document.getElementById("contenedorModulosUnicos");
const resultadoObjeto = document.getElementById("resultadoObjeto");

const tdSinModSinCaida = document.getElementById("sinModSinCaida");
const tdConModSinCaida = document.getElementById("conModSinCaida");
const tdSinModConCaida = document.getElementById("sinModConCaida");
const tdConModConCaida = document.getElementById("conModConCaida");

const listaHistorial = document.getElementById("listaHistorial");

// Renderizar toda la interfaz
function actualizarInterfaz() {
  // 1. Renderizar lista del Historial
  listaHistorial.innerHTML = "";
  historialServidor.forEach((sesion, index) => {
    const li = document.createElement("li");
    const estadoCaida = sesion.caidaSistema 
      ? '<span class="caida-true">CAÍDA (500)</span>' 
      : '<span class="caida-false">OK (200)</span>';
    
    li.innerHTML = `<strong>Sesión #${index + 1}:</strong> [${sesion.modulosCargados.join(", ")}] | Estado: ${estadoCaida}`;
    listaHistorial.appendChild(li);
  });

  // 2. Renderizar Módulos Únicos y menú de análisis
  const modulosUnicos = obtenerModulosUnicos(historialServidor);
  contenedorModulosUnicos.innerHTML = "";
  
  const seleccionActual = selectModulo.value;
  selectModulo.innerHTML = '<option value="">-- Selecciona un módulo --</option>';

  modulosUnicos.forEach(modulo => {
    // Agregar etiqueta visual
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = modulo;
    contenedorModulosUnicos.appendChild(tag);

    // Agregar opción al select de diagnóstico
    const option = document.createElement("option");
    option.value = modulo;
    option.textContent = modulo;
    selectModulo.appendChild(option);
  });

  // Restaurar selección previa de análisis
  if (modulosUnicos.includes(seleccionActual)) {
    selectModulo.value = seleccionActual;
    ejecutarDiagnostico(seleccionActual);
  } else if (modulosUnicos.length > 0) {
    selectModulo.value = modulosUnicos[0];
    ejecutarDiagnostico(modulosUnicos[0]);
  }
}

function ejecutarDiagnostico(nombreModulo) {
  if (!nombreModulo) return;

  const resultado = diagnosticarModulo(historialServidor, nombreModulo);

  resultadoObjeto.textContent = JSON.stringify(resultado, null, 2);

  tdSinModSinCaida.textContent = resultado.sinModuloSinCaida;
  tdConModSinCaida.textContent = resultado.conModuloSinCaida;
  tdSinModConCaida.textContent = resultado.sinModuloConCaida;
  tdConModConCaida.textContent = resultado.conModuloConCaida;
}

// Evento Submit: Extrae los elementos seleccionados del <select multiple>
formSesion.addEventListener("submit", (e) => {
  e.preventDefault();

  // Mapear las opciones seleccionadas del elemento <select multiple> a un Array de strings
  const modulosSeleccionados = Array.from(selectModulosMulti.selectedOptions).map(opcion => opcion.value);

  if (modulosSeleccionados.length === 0) return;

  const huboCaida = inputCaida.checked;

  // Invocar la función con la estructura de array que requiere el resto del código
  registrarSesion(historialServidor, modulosSeleccionados, huboCaida);

  // Desseleccionar las opciones del formulario y limpiar el checkbox
  selectModulosMulti.selectedIndex = -1;
  inputCaida.checked = false;

  actualizarInterfaz();
});

selectModulo.addEventListener("change", (e) => {
  ejecutarDiagnostico(e.target.value);
});

document.addEventListener("DOMContentLoaded", () => {
  actualizarInterfaz();
});