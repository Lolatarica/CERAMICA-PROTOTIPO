// src/App.jsx
import { useState } from 'react'
// Importamos todas las vistas que creamos
import AlumnoLogin from './views/AlumnoLogin'
import AlumnoAgendar from './views/AlumnoAgendar'
import AlumnoConfirmacion from './views/AlumnoConfirmacion'
import ProfesorDashboard from './views/ProfesorDashboard'
import ProfesorCupos from './views/ProfesorCupos'
import ProfesorClases from './views/ProfesorClases'
import ProfesorAlumnos from './views/ProfesorAlumnos' // La nueva vista de agenda
import ProfesorPagos from './views/ProfesorPagos'
import ProfesorSucursales from './views/ProfesorSucursales'
import {
  ALUMNOS_INICIALES,
  CLASES_INICIALES,
  DETALLES_TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE,
  esHoraValida,
  OPCIONES_PUBLICO,
  SUCURSALES_INICIALES,
  TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE,
  agregarClaseATodasLasSucursales,
  agregarClaseATodasLasSucursalesVacia,
  agregarSucursalAClases,
  construirTurnosDesdeConfig,
  obtenerDetalleTurno,
  tieneAsignacion,
  normalizarId,
} from './utils/agendaConfig'

function esAsignacionValida(asignacion) {
  return Boolean(asignacion?.sucursalId && asignacion?.claseId && asignacion?.turnoId)
}

function normalizarAsignacionesAlumno(alumno = {}) {
  const asignacionesActuales = Array.isArray(alumno.asignaciones) ? alumno.asignaciones : []
  const asignaciones = asignacionesActuales
    .filter(esAsignacionValida)
    .map((asignacion) => ({
      sucursalId: asignacion.sucursalId,
      claseId: asignacion.claseId,
      turnoId: asignacion.turnoId,
    }))

  if (esAsignacionValida(alumno)) {
    const asignacionPrincipal = {
      sucursalId: alumno.sucursalId,
      claseId: alumno.claseId,
      turnoId: alumno.turnoId,
    }

    const yaExiste = asignaciones.some((asignacion) =>
      asignacion.sucursalId === asignacionPrincipal.sucursalId &&
      asignacion.claseId === asignacionPrincipal.claseId &&
      asignacion.turnoId === asignacionPrincipal.turnoId
    )

    if (!yaExiste) {
      asignaciones.unshift(asignacionPrincipal)
    }
  }

  return asignaciones
}

function sincronizarAsignacionPrincipal(alumno = {}) {
  const asignaciones = normalizarAsignacionesAlumno(alumno)
  const asignacionPrincipal = asignaciones[0] || { sucursalId: '', claseId: '', turnoId: '' }

  return {
    ...alumno,
    asignaciones,
    sucursalId: asignacionPrincipal.sucursalId,
    claseId: asignacionPrincipal.claseId,
    turnoId: asignacionPrincipal.turnoId,
  }
}

const MESES_PAGO = ['Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Junio 2026']

function crearPerfilPagoInicial(indice = 0) {
  const metodoBase = indice % 2 === 0 ? 'efectivo' : 'cuentaBancaria'

  return {
    meses: {
      'Enero 2026': 'pagado',
      'Febrero 2026': 'pagado',
      'Marzo 2026': indice % 3 === 0 ? 'esperandoComprobante' : 'pagado',
      'Abril 2026': indice % 3 === 1 ? 'pendiente' : indice % 3 === 2 ? 'esperandoComprobante' : 'pagado',
      'Mayo 2026': 'pendiente',
      'Junio 2026': 'pendiente',
    },
    metodosPagoPorMes: {
      'Enero 2026': metodoBase,
      'Febrero 2026': metodoBase,
      'Marzo 2026': metodoBase,
      'Abril 2026': metodoBase,
      'Mayo 2026': metodoBase,
      'Junio 2026': metodoBase,
    },
  }
}

function crearPagosIniciales(alumnos = []) {
  return alumnos.reduce((acumulado, alumno, indice) => {
    acumulado[alumno.id] = crearPerfilPagoInicial(indice)
    return acumulado
  }, {})
}

function App() {
  // --- ESTADOS DE NAVEGACIÓN ---
  // Controla qué pantalla se ve: 'login', 'agendar', 'confirmacion', 'profesor', 'profesor-clases', 'profesor-cupos', 'profesor-alumnos'
  const [vistaActual, setVistaActual] = useState('login') // Controla qué pantalla se ve: 'login', 'agendar', 'confirmacion', 'profesor', 'profesor-clases', 'profesor-cupos', 'profesor-alumnos'
  
  // Guardan datos temporales para pasar entre pantallas
  const [claseParaVer, setClaseParaVer] = useState('') // Guardan datos temporales para pasar entre pantallas
  const [sucursalParaVer, setSucursalParaVer] = useState('')
  const [turnoElegido, setTurnoElegido] = useState('') // Guardan datos temporales para pasar entre pantallas
  const [profesoraElegida, setProfesoraElegida] = useState('Sin asignar')
  const [clases, setClases] = useState(CLASES_INICIALES)
  const [sucursales, setSucursales] = useState(SUCURSALES_INICIALES)
  const [alumnos, setAlumnos] = useState(() => ALUMNOS_INICIALES.map((alumno) => sincronizarAsignacionPrincipal(alumno)))
  const [turnosPorSucursalYClase, setTurnosPorSucursalYClase] = useState(TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE)
  const [detallesTurnosPorSucursalYClase, setDetallesTurnosPorSucursalYClase] = useState(DETALLES_TURNOS_INICIALES_POR_SUCURSAL_Y_CLASE)
  const [pagosAlumnos, setPagosAlumnos] = useState(() => crearPagosIniciales(ALUMNOS_INICIALES))

  const construirAlumnoDetalle = (alumno) => ({
    id: alumno.id,
    nombre: alumno.nombre,
    telefono: alumno.tel,
  })

  const removerAlumnoDeDetalles = (detallesActuales, alumnoId) => {
    const nuevosDetalles = { ...detallesActuales }

    Object.keys(nuevosDetalles).forEach((sucursalId) => {
      nuevosDetalles[sucursalId] = { ...nuevosDetalles[sucursalId] }

      Object.keys(nuevosDetalles[sucursalId]).forEach((claseId) => {
        nuevosDetalles[sucursalId][claseId] = { ...nuevosDetalles[sucursalId][claseId] }

        Object.keys(nuevosDetalles[sucursalId][claseId]).forEach((turnoId) => {
          const detalle = nuevosDetalles[sucursalId][claseId][turnoId]
          nuevosDetalles[sucursalId][claseId][turnoId] = {
            ...detalle,
            alumnos: (detalle.alumnos || []).filter((alumno) => alumno.id !== alumnoId),
          }
        })
      })
    })

    return nuevosDetalles
  }

  const agregarAlumnoADetalles = (detallesActuales, alumno) => {
    const asignaciones = normalizarAsignacionesAlumno(alumno)

    if (asignaciones.length === 0) {
      return detallesActuales
    }

    const nuevosDetalles = { ...detallesActuales }

    asignaciones.forEach((asignacion) => {
      const detalleTurno = nuevosDetalles[asignacion.sucursalId]?.[asignacion.claseId]?.[asignacion.turnoId] || { profesor: 'Sin asignar', alumnos: [] }

      nuevosDetalles[asignacion.sucursalId] = {
        ...(nuevosDetalles[asignacion.sucursalId] || {}),
        [asignacion.claseId]: {
          ...((nuevosDetalles[asignacion.sucursalId] || {})[asignacion.claseId] || {}),
          [asignacion.turnoId]: {
            ...detalleTurno,
            alumnos: [
              ...(detalleTurno.alumnos || []).filter((item) => item.id !== alumno.id),
              construirAlumnoDetalle(alumno),
            ],
          },
        },
      }
    })

    return nuevosDetalles
  }

  // --- FUNCIONES PARA CAMBIAR DE PANTALLA ---
  const manejarConfirmacionAlumno = ({ turnoId, sucursalId, claseId }) => {
    const detalleTurno = obtenerDetalleTurno(detallesTurnosPorSucursalYClase, sucursalId, claseId, turnoId)

    setTurnoElegido(turnoId)
    setProfesoraElegida(detalleTurno.profesor || 'Sin asignar')
    setVistaActual('confirmacion')
  }

  const manejarSeleccionSucursalProfesor = (idSucursal) => {
    setSucursalParaVer(idSucursal)
    setClaseParaVer((claseActual) => claseActual || CLASES_INICIALES[0]?.id || '')
    setVistaActual('profesor-clases')
  }

  const manejarAgregarClase = (nombreClase, publicoClase, sucursalId, profesor, config) => {
    const idClase = normalizarId(nombreClase)

    if (!nombreClase.trim() || !idClase || !publicoClase || !sucursalId || !profesor.trim()) {
      return false
    }

    const claseExistente = clases.find((clase) => clase.id === idClase)
    const turnosClase = construirTurnosDesdeConfig(config)

    if (!claseExistente) {
      const nuevaClase = {
        id: idClase,
        nombre: nombreClase.trim(),
        publico: publicoClase,
        config,
      }

      setClases((clasesActuales) => [...clasesActuales, nuevaClase])
      setTurnosPorSucursalYClase((turnosActuales) =>
        agregarClaseATodasLasSucursales(turnosActuales, sucursales, idClase, {})
      )
      setDetallesTurnosPorSucursalYClase((detallesActuales) =>
        agregarClaseATodasLasSucursalesVacia(detallesActuales, sucursales, idClase)
      )
    }

    setClases((clasesActuales) =>
      clasesActuales.map((clase) =>
        clase.id === idClase
          ? { ...clase, nombre: nombreClase.trim(), publico: publicoClase }
          : clase
      )
    )

    setTurnosPorSucursalYClase((turnosActuales) => ({
      ...turnosActuales,
      [sucursalId]: {
        ...(turnosActuales[sucursalId] || {}),
        [idClase]: {
          ...((turnosActuales[sucursalId] || {})[idClase] || {}),
          ...turnosClase,
        },
      },
    }))

    setDetallesTurnosPorSucursalYClase((detallesActuales) => ({
      ...detallesActuales,
      [sucursalId]: {
        ...(detallesActuales[sucursalId] || {}),
        [idClase]: {
          ...((detallesActuales[sucursalId] || {})[idClase] || {}),
          ...Object.fromEntries(
            Object.keys(turnosClase).map((turnoId) => [
              turnoId,
              {
                profesor: profesor.trim(),
                alumnos: ((detallesActuales[sucursalId] || {})[idClase] || {})[turnoId]?.alumnos || [],
              },
            ])
          ),
        },
      },
    }))

    setSucursalParaVer(sucursalId)
    setClaseParaVer(idClase)

    return true
  }

  const manejarAgregarSucursal = (nombreSucursal, direccionSucursal) => {
    const idSucursal = normalizarId(nombreSucursal)

    if (!nombreSucursal.trim() || !direccionSucursal.trim() || !idSucursal) {
      return false
    }

    if (sucursales.some((sucursal) => sucursal.id === idSucursal)) {
      return false
    }

    const nuevaSucursal = {
      id: idSucursal,
      nombre: nombreSucursal.trim(),
      direccion: direccionSucursal.trim(),
    }

    setSucursales((sucursalesActuales) => [...sucursalesActuales, nuevaSucursal])
    setTurnosPorSucursalYClase((turnosActuales) =>
      agregarSucursalAClases(turnosActuales, idSucursal, clases)
    )
    setDetallesTurnosPorSucursalYClase((detallesActuales) =>
      agregarSucursalAClases(detallesActuales, idSucursal, clases)
    )
    setSucursalParaVer(idSucursal)

    return true
  }

  const manejarEditarSucursal = (idSucursal, nombreSucursal, direccionSucursal) => {
    const idNormalizado = normalizarId(nombreSucursal)

    if (!nombreSucursal.trim() || !direccionSucursal.trim() || !idNormalizado) {
      return false
    }

    if (idNormalizado !== idSucursal && sucursales.some((sucursal) => sucursal.id === idNormalizado)) {
      return false
    }

    setSucursales((sucursalesActuales) =>
      sucursalesActuales.map((sucursal) =>
        sucursal.id === idSucursal
          ? { ...sucursal, id: idNormalizado, nombre: nombreSucursal.trim(), direccion: direccionSucursal.trim() }
          : sucursal
      )
    )

    if (idNormalizado !== idSucursal) {
      setTurnosPorSucursalYClase((turnosActuales) => {
        const turnosSucursal = turnosActuales[idSucursal] || {}
        const nuevosTurnos = { ...turnosActuales }
        delete nuevosTurnos[idSucursal]
        nuevosTurnos[idNormalizado] = turnosSucursal
        return nuevosTurnos
      })

      setDetallesTurnosPorSucursalYClase((detallesActuales) => {
        const detallesSucursal = detallesActuales[idSucursal] || {}
        const nuevosDetalles = { ...detallesActuales }
        delete nuevosDetalles[idSucursal]
        nuevosDetalles[idNormalizado] = detallesSucursal
        return nuevosDetalles
      })

      setSucursalParaVer((sucursalActual) => (sucursalActual === idSucursal ? idNormalizado : sucursalActual))
    }

    return true
  }

  const manejarEliminarSucursal = (idSucursal) => {
    setSucursales((sucursalesActuales) => {
      const sucursalesRestantes = sucursalesActuales.filter((sucursal) => sucursal.id !== idSucursal)
      setSucursalParaVer((sucursalActual) => {
        if (sucursalActual !== idSucursal) {
          return sucursalActual
        }

        return sucursalesRestantes[0]?.id || ''
      })
      return sucursalesRestantes
    })

    setTurnosPorSucursalYClase((turnosActuales) => {
      const nuevosTurnos = { ...turnosActuales }
      delete nuevosTurnos[idSucursal]
      return nuevosTurnos
    })

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      const nuevosDetalles = { ...detallesActuales }
      delete nuevosDetalles[idSucursal]
      return nuevosDetalles
    })

    return true
  }

  const manejarActualizarCupos = (idSucursal, idClase, idTurno, cupos) => {
    setTurnosPorSucursalYClase((turnosActuales) => ({
      ...turnosActuales,
      [idSucursal]: {
        ...(turnosActuales[idSucursal] || {}),
        [idClase]: {
          ...((turnosActuales[idSucursal] || {})[idClase] || {}),
          [idTurno]: cupos,
        },
      },
    }))

    setDetallesTurnosPorSucursalYClase((detallesActuales) => ({
      ...detallesActuales,
      [idSucursal]: {
        ...(detallesActuales[idSucursal] || {}),
        [idClase]: {
          ...((detallesActuales[idSucursal] || {})[idClase] || {}),
          [idTurno]: ((detallesActuales[idSucursal] || {})[idClase] || {})[idTurno] || { profesor: 'Sin asignar', alumnos: [] },
        },
      },
    }))
  }

  const manejarAjustarCupos = (idSucursal, idClase, idTurno, delta) => {
    const cuposActuales = turnosPorSucursalYClase[idSucursal]?.[idClase]?.[idTurno] ?? 0
    const nuevosCupos = Math.max(0, cuposActuales + delta)

    manejarActualizarCupos(idSucursal, idClase, idTurno, nuevosCupos)
  }

  const manejarGuardarAlumno = (datosAlumno) => {
    if (!datosAlumno.nombre?.trim() || !datosAlumno.tel?.trim() || !datosAlumno.mail?.trim()) {
      return false
    }

    const alumnoConDatos = sincronizarAsignacionPrincipal({
      ...datosAlumno,
      nombre: datosAlumno.nombre.trim(),
      tel: datosAlumno.tel.trim(),
      mail: datosAlumno.mail.trim(),
      antiguedad: datosAlumno.antiguedad || 'Nueva',
    })

    const esNuevo = !alumnoConDatos.id
    const idAlumno = esNuevo ? Date.now() : alumnoConDatos.id
    const alumnoFinal = { ...alumnoConDatos, id: idAlumno }

    setAlumnos((alumnosActuales) => {
      if (esNuevo) {
        return [...alumnosActuales, alumnoFinal]
      }

      return alumnosActuales.map((alumno) => (alumno.id === idAlumno ? alumnoFinal : alumno))
    })

    setPagosAlumnos((pagosActuales) => ({
      ...pagosActuales,
      [idAlumno]: pagosActuales[idAlumno] || crearPerfilPagoInicial(Object.keys(pagosActuales).length),
    }))

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      let nuevosDetalles = removerAlumnoDeDetalles(detallesActuales, idAlumno)
      nuevosDetalles = agregarAlumnoADetalles(nuevosDetalles, alumnoFinal)
      return nuevosDetalles
    })

    return true
  }

  const manejarDesasignarAlumno = (alumnoId, asignacionAEliminar = null) => {
    let alumnoActualizado = null

    setAlumnos((alumnosActuales) =>
      alumnosActuales.map((alumno) => {
        if (alumno.id !== alumnoId) {
          return alumno
        }

        const asignacionesActuales = normalizarAsignacionesAlumno(alumno)
        const asignacionesFiltradas = asignacionAEliminar
          ? asignacionesActuales.filter((asignacion) => !(
              asignacion.sucursalId === asignacionAEliminar.sucursalId &&
              asignacion.claseId === asignacionAEliminar.claseId &&
              asignacion.turnoId === asignacionAEliminar.turnoId
            ))
          : []

        alumnoActualizado = sincronizarAsignacionPrincipal({
          ...alumno,
          asignaciones: asignacionesFiltradas,
        })

        return alumnoActualizado
      })
    )

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      let nuevosDetalles = removerAlumnoDeDetalles(detallesActuales, alumnoId)

      if (alumnoActualizado) {
        nuevosDetalles = agregarAlumnoADetalles(nuevosDetalles, alumnoActualizado)
      }

      return nuevosDetalles
    })
  }

  const manejarAgregarAsignacionAlumno = (alumnoId, nuevaAsignacion) => {
    if (!esAsignacionValida(nuevaAsignacion)) {
      return false
    }

    let alumnoActualizado = null
    let yaExiste = false

    setAlumnos((alumnosActuales) =>
      alumnosActuales.map((alumno) => {
        if (alumno.id !== alumnoId) {
          return alumno
        }

        const asignacionesActuales = normalizarAsignacionesAlumno(alumno)
        yaExiste = asignacionesActuales.some((asignacion) =>
          asignacion.sucursalId === nuevaAsignacion.sucursalId &&
          asignacion.claseId === nuevaAsignacion.claseId &&
          asignacion.turnoId === nuevaAsignacion.turnoId
        )

        if (yaExiste) {
          alumnoActualizado = alumno
          return alumno
        }

        alumnoActualizado = sincronizarAsignacionPrincipal({
          ...alumno,
          asignaciones: [...asignacionesActuales, nuevaAsignacion],
        })

        return alumnoActualizado
      })
    )

    if (yaExiste || !alumnoActualizado) {
      return false
    }

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      let nuevosDetalles = removerAlumnoDeDetalles(detallesActuales, alumnoId)
      nuevosDetalles = agregarAlumnoADetalles(nuevosDetalles, alumnoActualizado)
      return nuevosDetalles
    })

    return true
  }

  const manejarEliminarHorario = (idSucursal, idClase, idTurno) => {
    setTurnosPorSucursalYClase((turnosActuales) => {
      const nuevosTurnos = { ...turnosActuales }
      const turnosClase = { ...(nuevosTurnos[idSucursal]?.[idClase] || {}) }
      delete turnosClase[idTurno]

      nuevosTurnos[idSucursal] = {
        ...(nuevosTurnos[idSucursal] || {}),
        [idClase]: turnosClase,
      }

      return nuevosTurnos
    })

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      const nuevosDetalles = { ...detallesActuales }
      const detallesClase = { ...(nuevosDetalles[idSucursal]?.[idClase] || {}) }
      delete detallesClase[idTurno]

      nuevosDetalles[idSucursal] = {
        ...(nuevosDetalles[idSucursal] || {}),
        [idClase]: detallesClase,
      }

      return nuevosDetalles
    })
  }

  const manejarActualizarEstadoPago = (alumnoId, mes, estado) => {
    setPagosAlumnos((pagosActuales) => ({
      ...pagosActuales,
      [alumnoId]: {
        ...(pagosActuales[alumnoId] || crearPerfilPagoInicial()),
        meses: {
          ...(pagosActuales[alumnoId]?.meses || {}),
          [mes]: estado,
        },
      },
    }))
  }

  const manejarActualizarMetodoPago = (alumnoId, mes, metodoPago) => {
    setPagosAlumnos((pagosActuales) => ({
      ...pagosActuales,
      [alumnoId]: {
        ...(pagosActuales[alumnoId] || crearPerfilPagoInicial()),
        meses: {
          ...((pagosActuales[alumnoId] || crearPerfilPagoInicial()).meses || {}),
        },
        metodosPagoPorMes: {
          ...((pagosActuales[alumnoId] || crearPerfilPagoInicial()).metodosPagoPorMes || {}),
          [mes]: metodoPago,
        },
      },
    }))
  }

  const manejarGuardarEdicionComision = ({
    originalSucursalId,
    originalClaseId,
    originalTurnoId,
    sucursalId,
    dia,
    hora,
    profesor,
    alumnos,
    originalAlumnoIds,
    nombreClase,
    publico,
  }) => {
    const nuevoTurnoId = `${dia}-${hora}`

    if (!nombreClase.trim() || !publico || !sucursalId || !dia || !esHoraValida(hora)) {
      return false
    }

    const existeDestino = turnosPorSucursalYClase[sucursalId]?.[originalClaseId]?.[nuevoTurnoId] !== undefined
    const mismoTurno = originalSucursalId === sucursalId && originalTurnoId === nuevoTurnoId

    if (existeDestino && !mismoTurno) {
      return false
    }

    setClases((clasesActuales) =>
      clasesActuales.map((clase) =>
        clase.id === originalClaseId
          ? { ...clase, nombre: nombreClase.trim(), publico }
          : clase
      )
    )

    const cuposActuales = turnosPorSucursalYClase[originalSucursalId]?.[originalClaseId]?.[originalTurnoId] ?? 0
    const alumnosSeleccionadosIds = alumnos.map((alumno) => alumno.id)

    setTurnosPorSucursalYClase((turnosActuales) => {
      const nuevosTurnos = { ...turnosActuales }
      const turnosOrigen = { ...(nuevosTurnos[originalSucursalId]?.[originalClaseId] || {}) }
      delete turnosOrigen[originalTurnoId]

      nuevosTurnos[originalSucursalId] = {
        ...(nuevosTurnos[originalSucursalId] || {}),
        [originalClaseId]: turnosOrigen,
      }

      nuevosTurnos[sucursalId] = {
        ...(nuevosTurnos[sucursalId] || {}),
        [originalClaseId]: {
          ...((nuevosTurnos[sucursalId] || {})[originalClaseId] || {}),
          [nuevoTurnoId]: cuposActuales,
        },
      }

      return nuevosTurnos
    })

    setDetallesTurnosPorSucursalYClase((detallesActuales) => {
      const nuevosDetalles = { ...detallesActuales }
      const detallesOrigen = { ...(nuevosDetalles[originalSucursalId]?.[originalClaseId] || {}) }
      delete detallesOrigen[originalTurnoId]

      nuevosDetalles[originalSucursalId] = {
        ...(nuevosDetalles[originalSucursalId] || {}),
        [originalClaseId]: detallesOrigen,
      }

      nuevosDetalles[sucursalId] = {
        ...(nuevosDetalles[sucursalId] || {}),
        [originalClaseId]: {
          ...((nuevosDetalles[sucursalId] || {})[originalClaseId] || {}),
          [nuevoTurnoId]: {
            profesor: profesor.trim() || 'Sin asignar',
            alumnos,
          },
        },
      }

      return nuevosDetalles
    })

    setAlumnos((alumnosActuales) =>
      alumnosActuales.map((alumno) => {
        const asignacionesActuales = normalizarAsignacionesAlumno(alumno)

        if (alumnosSeleccionadosIds.includes(alumno.id)) {
          const asignacionesSinOriginal = asignacionesActuales.filter((asignacion) => !(
            asignacion.sucursalId === originalSucursalId &&
            asignacion.claseId === originalClaseId &&
            asignacion.turnoId === originalTurnoId
          ))

          return sincronizarAsignacionPrincipal({
            ...alumno,
            asignaciones: [
              ...asignacionesSinOriginal,
              { sucursalId, claseId: originalClaseId, turnoId: nuevoTurnoId },
            ],
          })
        }

        if (originalAlumnoIds.includes(alumno.id)) {
          return sincronizarAsignacionPrincipal({
            ...alumno,
            asignaciones: asignacionesActuales.filter((asignacion) => !(
              asignacion.sucursalId === originalSucursalId &&
              asignacion.claseId === originalClaseId &&
              asignacion.turnoId === originalTurnoId
            )),
          })
        }

        return alumno
      })
    )

    return true
  }

  return (
    <div>
      {/* 1. FLUJO DEL ALUMNO */}
      {vistaActual === 'login' && (
        <AlumnoLogin 
          onSiguiente={() => setVistaActual('agendar')} 
          onAccesoProfesor={() => setVistaActual('profesor')} 
        />
      )}

      {vistaActual === 'agendar' && (
        <AlumnoAgendar 
          clases={clases}
          sucursales={sucursales}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          onConfirmar={manejarConfirmacionAlumno} 
        />
      )}

      {vistaActual === 'confirmacion' && (
        <AlumnoConfirmacion 
          nombre="Lola" 
          turno={turnoElegido} 
          profesora={profesoraElegida}
          onVolverInicio={() => setVistaActual('login')} 
        />
      )}

      {/* 2. FLUJO DEL PROFESOR (DASHBOARD) */}
      {vistaActual === 'profesor' && (
        <ProfesorDashboard 
          onLogout={() => setVistaActual('login')} 
          onIrAClases={() => {
            setClaseParaVer('')
            setSucursalParaVer('')
            setVistaActual('profesor-clases')
          }}
          onIrACupos={() => {
            setClaseParaVer('')
            setSucursalParaVer('')
            setVistaActual('profesor-cupos')
          }}
          onIrASucursales={() => setVistaActual('profesor-sucursales')}
          onIrAAlumnos={() => setVistaActual('profesor-alumnos')}
          onIrAPagos={() => setVistaActual('profesor-pagos')}
        />
      )}

      {/* 3. GESTIÓN DE CLASES (LISTADO) */}
      {vistaActual === 'profesor-clases' && (
        <ProfesorClases 
          alumnos={alumnos}
          clases={clases}
          sucursales={sucursales}
          opcionesPublico={OPCIONES_PUBLICO}
          claseInicial={claseParaVer}
          sucursalInicial={sucursalParaVer}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          detallesTurnosPorSucursalYClase={detallesTurnosPorSucursalYClase}
          onVolver={() => setVistaActual('profesor')} 
          onAgregarClase={manejarAgregarClase}
          onAjustarCupos={manejarAjustarCupos}
          onGuardarEdicionComision={manejarGuardarEdicionComision}
        />
      )}

      {vistaActual === 'profesor-sucursales' && (
        <ProfesorSucursales
          sucursales={sucursales}
          onVolver={() => setVistaActual('profesor')}
          onAgregarSucursal={manejarAgregarSucursal}
          onEditarSucursal={manejarEditarSucursal}
          onEliminarSucursal={manejarEliminarSucursal}
          onSeleccionarSucursal={manejarSeleccionSucursalProfesor}
        />
      )}

      {/* 4. CALENDARIO DE LA CLASE (CUPOS Y ANOTADOS) */}
      {vistaActual === 'profesor-cupos' && (
        <ProfesorCupos 
          clases={clases}
          sucursales={sucursales}
          claseInicial={claseParaVer}
          sucursalInicial={sucursalParaVer}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          detallesTurnosPorSucursalYClase={detallesTurnosPorSucursalYClase}
          onActualizarCupos={manejarActualizarCupos}
          onEliminarHorario={manejarEliminarHorario}
          onVolver={() => setVistaActual('profesor')} 
        />
      )}

      {/* 5. AGENDA GENERAL DE ALUMNOS (FILTROS Y CONTACTOS) */}
      {vistaActual === 'profesor-alumnos' && (
        <ProfesorAlumnos 
          alumnos={alumnos}
          clases={clases}
          sucursales={sucursales}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          pagosAlumnos={pagosAlumnos}
          mesesPago={MESES_PAGO}
          onAgregarAsignacion={manejarAgregarAsignacionAlumno}
          onGuardarAlumno={manejarGuardarAlumno}
          onDesasignarAlumno={manejarDesasignarAlumno}
          onActualizarEstadoPago={manejarActualizarEstadoPago}
          onActualizarMetodoPago={manejarActualizarMetodoPago}
          onVolver={() => setVistaActual('profesor')} 
        />
      )}

      {/* 6. CONTROL DE PAGOS */}
      {vistaActual === 'profesor-pagos' && (
        <ProfesorPagos
          alumnos={alumnos}
          clases={clases}
          sucursales={sucursales}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          pagosAlumnos={pagosAlumnos}
          mesesPago={MESES_PAGO}
          onAgregarAsignacion={manejarAgregarAsignacionAlumno}
          onGuardarAlumno={manejarGuardarAlumno}
          onDesasignarAlumno={manejarDesasignarAlumno}
          onActualizarEstadoPago={manejarActualizarEstadoPago}
          onActualizarMetodoPago={manejarActualizarMetodoPago}
          onVolver={() => setVistaActual('profesor')}
        />
      )}
    </div>
  )
}

export default App