export const DIAS_SEMANA = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

export const HORAS_BASE = ['09:00', '10:30', '14:00', '16:00', '18:00'];

export const CLASES_INICIALES = [
  { id: 'ceramica', nombre: 'Taller de Ceramica', publico: 'adultos' },
  { id: 'pintura', nombre: 'Taller de Pintura', publico: 'ninos' },
];

export const OPCIONES_PUBLICO = [
  { id: 'adultos', label: 'Adultos' },
  { id: 'ninos', label: 'Niños' },
];

export const SUCURSALES_INICIALES = [
  { id: 'fernandez-de-enciso', nombre: 'Fernandez de Enciso', direccion: 'Fernandez de Enciso 4567, Villa Devoto' },
  { id: 'nazca', nombre: 'Nazca', direccion: 'Av. Nazca 1820, Villa del Parque' },
];

export const TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE = {
  'fernandez-de-enciso': {
    ceramica: {
      'LU-09:00': 4,
      'MA-10:30': 0,
      'MA-16:00': 4,
      'MI-14:00': 4,
      'JU-10:30': 4,
      'JU-18:00': 0,
      'VI-09:00': 4,
      'VI-14:00': 4,
    },
    pintura: {
      'LU-14:00': 4,
      'MI-09:00': 0,
      'MI-18:00': 4,
      'JU-14:00': 4,
      'VI-16:00': 4,
    },
  },
  nazca: {
    ceramica: {
      'LU-10:30': 4,
      'MA-14:00': 4,
      'MI-16:00': 0,
      'JU-09:00': 4,
      'VI-18:00': 4,
      'SA-10:30': 0,
    },
    pintura: {
      'LU-16:00': 4,
      'MA-09:00': 4,
      'JU-16:00': 0,
      'VI-14:00': 4,
      'SA-09:00': 4,
    },
  },
};

export const DETALLES_TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE = {
  'fernandez-de-enciso': {
    ceramica: {
      'LU-09:00': {
        profesor: 'Paula Herrera',
        alumnos: [
          { id: 1, nombre: 'María López', telefono: '11 2233 4455' },
          { id: 2, nombre: 'Juan Pérez', telefono: '11 9988 7766' },
        ],
      },
      'MA-16:00': {
        profesor: 'Paula Herrera',
        alumnos: [{ id: 3, nombre: 'Luciana Pérez', telefono: '11 3456 1200' }],
      },
      'VI-14:00': {
        profesor: 'Bruno Costa',
        alumnos: [],
      },
    },
    pintura: {
      'LU-14:00': {
        profesor: 'Sofía Roldán',
        alumnos: [{ id: 4, nombre: 'Ana Gómez', telefono: '11 5566 7788' }],
      },
      'MI-18:00': {
        profesor: 'Sofía Roldán',
        alumnos: [{ id: 5, nombre: 'Micaela Ruiz', telefono: '11 3000 1122' }],
      },
    },
  },
  nazca: {
    ceramica: {
      'LU-10:30': {
        profesor: 'Tomás Leiva',
        alumnos: [{ id: 6, nombre: 'Lucas Silva', telefono: '11 4100 2000' }],
      },
      'JU-09:00': {
        profesor: 'Tomás Leiva',
        alumnos: [],
      },
    },
    pintura: {
      'MA-09:00': {
        profesor: 'Julieta Mora',
        alumnos: [{ id: 7, nombre: 'Carla Ruiz', telefono: '11 4999 2233' }],
      },
      'VI-14:00': {
        profesor: 'Julieta Mora',
        alumnos: [{ id: 8, nombre: 'Elena Castro', telefono: '11 5123 4433' }],
      },
    },
  },
};

export const ALUMNOS_INICIALES = [
  {
    id: 1,
    nombre: 'María López',
    tel: '+54 11 2233 4455',
    mail: 'maria@gmail.com',
    antiguedad: 'Nueva',
    sucursalId: 'fernandez-de-enciso',
    claseId: 'ceramica',
    turnoId: 'LU-09:00',
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    tel: '+54 11 9988 7766',
    mail: 'juan_p@hotmail.com',
    antiguedad: 'Viejo',
    sucursalId: 'fernandez-de-enciso',
    claseId: 'ceramica',
    turnoId: 'LU-09:00',
  },
  {
    id: 3,
    nombre: 'Luciana Pérez',
    tel: '+54 11 3456 1200',
    mail: 'luciana@gmail.com',
    antiguedad: 'Viejo',
    sucursalId: 'fernandez-de-enciso',
    claseId: 'ceramica',
    turnoId: 'MA-16:00',
  },
  {
    id: 4,
    nombre: 'Ana Gómez',
    tel: '+54 11 5566 7788',
    mail: 'anita@live.com',
    antiguedad: 'Viejo',
    sucursalId: 'fernandez-de-enciso',
    claseId: 'pintura',
    turnoId: 'LU-14:00',
  },
  {
    id: 5,
    nombre: 'Micaela Ruiz',
    tel: '+54 11 3000 1122',
    mail: 'mica@gmail.com',
    antiguedad: 'Nueva',
    sucursalId: 'fernandez-de-enciso',
    claseId: 'pintura',
    turnoId: 'MI-18:00',
  },
  {
    id: 6,
    nombre: 'Lucas Silva',
    tel: '+54 11 4100 2000',
    mail: 'lucas@gmail.com',
    antiguedad: 'Nueva',
    sucursalId: 'nazca',
    claseId: 'ceramica',
    turnoId: 'LU-10:30',
  },
  {
    id: 7,
    nombre: 'Carla Ruiz',
    tel: '+54 11 4999 2233',
    mail: 'cruiz@yahoo.com',
    antiguedad: 'Nueva',
    sucursalId: 'nazca',
    claseId: 'pintura',
    turnoId: 'MA-09:00',
  },
  {
    id: 8,
    nombre: 'Elena Castro',
    tel: '+54 11 5123 4433',
    mail: 'elena@gmail.com',
    antiguedad: 'Viejo',
    sucursalId: 'nazca',
    claseId: 'pintura',
    turnoId: 'VI-14:00',
  },
];

export function normalizarId(valor) {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function construirTurnosDesdeConfig(config = []) {
  return config.reduce((turnos, fila) => {
    const horaBase = fila.hora || fila.horaInicio;

    Object.entries(fila.cupos || {}).forEach(([dia, cupo]) => {
      if (horaBase && cupo !== '' && cupo !== null && cupo !== undefined) {
        turnos[`${dia}-${horaBase}`] = Number(cupo);
      }
    });

    return turnos;
  }, {});
}

export function agregarClaseATodasLasSucursales(turnosActuales, sucursales, claseId, turnosClase = {}) {
  return sucursales.reduce((acumulado, sucursal) => {
    acumulado[sucursal.id] = {
      ...(turnosActuales[sucursal.id] || {}),
      [claseId]: { ...turnosClase },
    };
    return acumulado;
  }, { ...turnosActuales });
}

export function agregarSucursalAClases(turnosActuales, sucursalId, clases) {
  return {
    ...turnosActuales,
    [sucursalId]: clases.reduce((acumulado, clase) => {
      acumulado[clase.id] = {};
      return acumulado;
    }, {}),
  };
}

export function agregarClaseATodasLasSucursalesVacia(estructuraActual, sucursales, claseId) {
  return sucursales.reduce((acumulado, sucursal) => {
    acumulado[sucursal.id] = {
      ...(estructuraActual[sucursal.id] || {}),
      [claseId]: {},
    };
    return acumulado;
  }, { ...estructuraActual });
}

export function obtenerDetalleTurno(detallesTurnos, sucursalId, claseId, turnoId) {
  return detallesTurnos[sucursalId]?.[claseId]?.[turnoId] || { profesor: 'Sin asignar', alumnos: [] };
}

export function ordenarHoras(horas = []) {
  return [...horas].sort((horaA, horaB) => {
    const [horasA, minutosA] = horaA.split(':').map(Number);
    const [horasB, minutosB] = horaB.split(':').map(Number);

    return (horasA * 60 + minutosA) - (horasB * 60 + minutosB);
  });
}

export function esHoraValida(hora = '') {
  return /^\d{2}:\d{2}$/.test(hora);
}

export function tieneAsignacion(alumno) {
  if (Array.isArray(alumno?.asignaciones)) {
    return alumno.asignaciones.some((asignacion) => asignacion?.sucursalId && asignacion?.claseId && asignacion?.turnoId)
  }

  return Boolean(alumno?.sucursalId && alumno?.claseId && alumno?.turnoId);
}