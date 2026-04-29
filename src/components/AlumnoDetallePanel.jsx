// src/components/AlumnoDetallePanel.jsx
import React, { useEffect, useMemo, useState } from 'react'
import CalendarioCupos from './CalendarioCupos'
import InputSimple from './InputSimple'
import { formatClassTimeRange } from '../utils/timeFormat'
import { DIAS_SEMANA, HORAS_BASE, ordenarHoras } from '../utils/agendaConfig'
import './AlumnoDetallePanel.css' // <-- Importá la hoja de estilos

function AlumnoDetallePanel({
  alumno,
  clases,
  sucursales,
  turnosPorSucursalYClase,
  pagosAlumno,
  mesesPago,
  onActualizarEstadoPago,
  onActualizarMetodoPago,
  claseInicialPagos,
  onClose,
  onAgregarAsignacion,
  onQuitarAsignacion,
  onGuardarDatosAlumno,
}) {
  const [detalleAsignacion, setDetalleAsignacion] = useState({ sucursalId: '', claseId: '', turnoId: '' })
  const [modoEdicionDatos, setModoEdicionDatos] = useState(false)
  const [formDatosAlumno, setFormDatosAlumno] = useState({ nombre: '', tel: '', mail: '' })
  const [erroresDatosAlumno, setErroresDatosAlumno] = useState({})
  const [claseSeleccionadaPagos, setClaseSeleccionadaPagos] = useState('')

  useEffect(() => {
    setModoEdicionDatos(false)
    setErroresDatosAlumno({})
    setFormDatosAlumno({
      nombre: alumno?.nombre || '',
      tel: alumno?.tel || '',
      mail: alumno?.mail || '',
    })
  }, [alumno])

  const asignaciones = useMemo(() => {
    if (Array.isArray(alumno?.asignaciones) && alumno.asignaciones.length > 0) {
      return alumno.asignaciones.filter((asignacion) => asignacion?.sucursalId && asignacion?.claseId && asignacion?.turnoId)
    }

    if (alumno?.sucursalId && alumno?.claseId && alumno?.turnoId) {
      return [{ sucursalId: alumno.sucursalId, claseId: alumno.claseId, turnoId: alumno.turnoId }]
    }

    return []
  }, [alumno])

  const opcionesClasePagos = useMemo(() => {
    const idsVistos = new Set()

    return asignaciones
      .filter((asignacion) => {
        if (!asignacion?.claseId || idsVistos.has(asignacion.claseId)) {
          return false
        }

        idsVistos.add(asignacion.claseId)
        return true
      })
      .map((asignacion) => ({
        claseId: asignacion.claseId,
        nombre: clases.find((item) => item.id === asignacion.claseId)?.nombre || asignacion.claseId,
      }))
  }, [asignaciones, clases])

  useEffect(() => {
    if (opcionesClasePagos.length === 0) {
      setClaseSeleccionadaPagos('')
      return
    }

    const idsClase = opcionesClasePagos.map((opcion) => opcion.claseId)
    const claseInicial = claseInicialPagos && idsClase.includes(claseInicialPagos)
      ? claseInicialPagos
      : idsClase[0]

    setClaseSeleccionadaPagos((actual) => (actual && idsClase.includes(actual) ? actual : claseInicial))
  }, [claseInicialPagos, opcionesClasePagos])

  const turnosActualesNuevaAsignacion = useMemo(() => {
    if (!detalleAsignacion.sucursalId || !detalleAsignacion.claseId) {
      return {}
    }

    return turnosPorSucursalYClase[detalleAsignacion.sucursalId]?.[detalleAsignacion.claseId] || {}
  }, [detalleAsignacion.claseId, detalleAsignacion.sucursalId, turnosPorSucursalYClase])

  const horasCalendarioNuevaAsignacion = useMemo(
    () => ordenarHoras(Array.from(new Set([
      ...HORAS_BASE,
      ...Object.keys(turnosActualesNuevaAsignacion).map((turnoId) => turnoId.split('-')[1]),
    ]))),
    [turnosActualesNuevaAsignacion]
  )

  const getDescripcionAsignacion = (asignacion) => {
    const sucursal = sucursales.find((item) => item.id === asignacion.sucursalId)?.nombre || asignacion.sucursalId
    const clase = clases.find((item) => item.id === asignacion.claseId)?.nombre || asignacion.claseId
    const [dia, hora] = asignacion.turnoId.split('-')

    return {
      clase,
      sucursal,
      horario: `${dia} ${formatClassTimeRange(hora)}`,
    }
  }

  const handleChangeDetalleAsignacion = (campo, valor) => {
    setDetalleAsignacion((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'sucursalId' ? { claseId: '', turnoId: '' } : {}),
      ...(campo === 'claseId' ? { turnoId: '' } : {}),
    }))
  }

  const handleAgregarAsignacion = () => {
    if (!detalleAsignacion.sucursalId || !detalleAsignacion.claseId || !detalleAsignacion.turnoId) {
      return
    }

    const yaExiste = asignaciones.some((asignacion) =>
      asignacion.sucursalId === detalleAsignacion.sucursalId &&
      asignacion.claseId === detalleAsignacion.claseId &&
      asignacion.turnoId === detalleAsignacion.turnoId
    )

    if (yaExiste) {
      alert('Esa clase ya esta asignada a este alumno')
      return
    }

    const guardadoOk = onAgregarAsignacion(detalleAsignacion)

    if (guardadoOk === false) {
      return
    }

    setDetalleAsignacion({ sucursalId: '', claseId: '', turnoId: '' })
  }

  const pagosClaseSeleccionada = useMemo(() => {
    if (!claseSeleccionadaPagos) {
      return pagosAlumno
    }

    return pagosAlumno?.porClase?.[claseSeleccionadaPagos] || pagosAlumno
  }, [claseSeleccionadaPagos, pagosAlumno])

  const getEstadoPago = (mes) => pagosClaseSeleccionada?.meses?.[mes] || 'pendiente'
  const getMetodoPagoMes = (mes) => pagosClaseSeleccionada?.metodosPagoPorMes?.[mes] || 'efectivo'

  const handleEditarDatosAlumno = () => {
    setModoEdicionDatos(true)
    setErroresDatosAlumno({})
    setFormDatosAlumno({
      nombre: alumno?.nombre || '',
      tel: alumno?.tel || '',
      mail: alumno?.mail || '',
    })
  }

  const handleCancelarEdicionDatos = () => {
    setModoEdicionDatos(false)
    setErroresDatosAlumno({})
    setFormDatosAlumno({
      nombre: alumno?.nombre || '',
      tel: alumno?.tel || '',
      mail: alumno?.mail || '',
    })
  }

  const handleCambiarDatoAlumno = (campo, valor) => {
    setErroresDatosAlumno((actual) => ({
      ...actual,
      [campo]: null,
    }))

    setFormDatosAlumno((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const handleGuardarDatosAlumno = () => {
    if (typeof onGuardarDatosAlumno !== 'function') {
      return
    }

    const resultado = onGuardarDatosAlumno(formDatosAlumno)

    if (resultado?.errores) {
      setErroresDatosAlumno(resultado.errores)
      return
    }

    if (resultado?.ok === false || resultado === false) {
      if (resultado?.mensaje) {
        alert(resultado.mensaje)
      }
      return
    }

    setModoEdicionDatos(false)
  }

  const getBotonEstado = (estado) => {
    if (estado === 'pagado') {
      return {
        texto: 'Pago',
        siguienteEstado: 'pendiente',
        clase: 'alumno-detalle-btn-pago--pagado',
      }
    }

    if (estado === 'esperandoComprobante') {
      return {
        texto: 'Comprobante inicial',
        siguienteEstado: 'pendiente',
        clase: 'alumno-detalle-btn-pago--esperando',
      }
    }

    return {
      texto: 'Deuda',
      siguienteEstado: 'pagado',
      clase: 'alumno-detalle-btn-pago--deuda',
    }
  }

  return (
    <div className="alumno-detalle-overlay">
      <div className="alumno-detalle-modal">
        <div className="alumno-detalle-header">
          <div>
            <h3 className="alumno-detalle-title">{alumno.nombre}</h3>
            <p className="alumno-detalle-subtitle">Detalle del alumno</p>
          </div>
          <button type="button" className="alumno-detalle-close-button" onClick={onClose} aria-label="Cerrar detalle">
            ×
          </button>
        </div>

        <section className="alumno-detalle-section">
          {modoEdicionDatos ? (
            <div className="alumno-detalle-info-edit-box">
              <InputSimple
                label="Nombre *"
                placeholder="Nombre del alumno"
                value={formDatosAlumno.nombre}
                onChange={(event) => handleCambiarDatoAlumno('nombre', event.target.value)}
                error={erroresDatosAlumno.nombre}
              />
              <InputSimple
                label="Telefono *"
                placeholder="Telefono del alumno"
                value={formDatosAlumno.tel}
                onChange={(event) => handleCambiarDatoAlumno('tel', event.target.value)}
                error={erroresDatosAlumno.tel}
              />
              <InputSimple
                label="Mail *"
                type="email"
                placeholder="Mail del alumno"
                value={formDatosAlumno.mail}
                onChange={(event) => handleCambiarDatoAlumno('mail', event.target.value)}
                error={erroresDatosAlumno.mail}
              />
              <div className="alumno-detalle-info-actions">
                <button type="button" className="alumno-detalle-info-cancel" onClick={handleCancelarEdicionDatos}>
                  Cancelar
                </button>
                <button type="button" className="alumno-detalle-info-save" onClick={handleGuardarDatosAlumno}>
                  Guardar cambios
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="responsive-inline-grid responsive-inline-grid--2 alumno-detalle-info-grid">
                <div className="alumno-detalle-info-block">
                  <span className="alumno-detalle-info-label">Telefono</span>
                  <span className="alumno-detalle-info-value">{alumno.tel || 'Sin dato'}</span>
                </div>
                <div className="alumno-detalle-info-block">
                  <span className="alumno-detalle-info-label">Mail</span>
                  <span className="alumno-detalle-info-value">{alumno.mail || 'Sin dato'}</span>
                </div>
              </div>
              <button type="button" className="alumno-detalle-edit-button" onClick={handleEditarDatosAlumno}>
                Editar alumno
              </button>
            </>
          )}
        </section>

        <section className="alumno-detalle-section">
          <h4 className="alumno-detalle-section-title">Clases asignadas</h4>
          <div className="alumno-detalle-assignment-list">
            {asignaciones.length === 0 ? (
              <p className="alumno-detalle-empty-state">Todavia no tiene clases asignadas.</p>
            ) : (
              asignaciones.map((asignacion) => {
                const detalle = getDescripcionAsignacion(asignacion)

                return (
                  <div key={`${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} className="alumno-detalle-assignment-card">
                    <div className="alumno-detalle-assignment-body">
                      <p className="alumno-detalle-assignment-class">{detalle.clase}</p>
                      <p className="alumno-detalle-assignment-meta">{detalle.sucursal}</p>
                      <p className="alumno-detalle-assignment-meta">{detalle.horario}</p>
                    </div>
                    <button
                      type="button"
                      className="alumno-detalle-remove-button"
                      aria-label="Desasignar clase"
                      onClick={() => onQuitarAsignacion(asignacion)}
                    >-</button>
                  </div>
                )
              })
            )}
          </div>
        </section>


        {typeof onAgregarAsignacion === 'function' && (
          <section className="alumno-detalle-section">
            <h4 className="alumno-detalle-section-title">Asignar otra clase</h4>
            <div className="alumno-detalle-assign-box alumno-detalle-form-grid">
              <div>
                <label className="alumno-detalle-label">Sucursal</label>
                <select
                  className="alumno-detalle-select"
                  value={detalleAsignacion.sucursalId}
                  onChange={(event) => handleChangeDetalleAsignacion('sucursalId', event.target.value)}
                >
                  <option value="">Selecciona una sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="alumno-detalle-label">Taller</label>
                <select
                  className="alumno-detalle-select"
                  value={detalleAsignacion.claseId}
                  onChange={(event) => handleChangeDetalleAsignacion('claseId', event.target.value)}
                  disabled={!detalleAsignacion.sucursalId}
                >
                  <option value="">Selecciona un taller</option>
                  {clases.map((clase) => (
                    <option key={clase.id} value={clase.id}>{clase.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="alumno-detalle-form-item--full">
                <label className="alumno-detalle-label">Calendario</label>
                <p className="alumno-detalle-helper">Elegi el dia y horario tocando una celda disponible.</p>
                <div className="alumno-detalle-calendar-shell">
                  <CalendarioCupos
                    dias={DIAS_SEMANA}
                    horas={horasCalendarioNuevaAsignacion}
                    turnosActuales={turnosActualesNuevaAsignacion}
                    compacto
                    modoEdicion={false}
                    selectedDia={detalleAsignacion.turnoId ? detalleAsignacion.turnoId.split('-')[0] : ''}
                    selectedHora={detalleAsignacion.turnoId ? detalleAsignacion.turnoId.split('-')[1] : ''}
                    onSelectTurno={(dia, hora) => handleChangeDetalleAsignacion('turnoId', `${dia}-${hora}`)}
                  />
                </div>
              </div>
              <div className="alumno-detalle-form-item--full">
                <button type="button" className="alumno-detalle-add-button" onClick={handleAgregarAsignacion}>
                  Asignar clase
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="alumno-detalle-section">
          <h4 className="alumno-detalle-section-title">Calendario de pagos</h4>
          <div className="alumno-detalle-payment-box">
            {opcionesClasePagos.length > 1 && (
              <div className="alumno-detalle-payment-class-filter">
                <label className="alumno-detalle-payment-class-label" htmlFor="alumno-detalle-clase-pagos-select">
                  Ver pagos de
                </label>
                <select
                  id="alumno-detalle-clase-pagos-select"
                  className="alumno-detalle-payment-class-select"
                  value={claseSeleccionadaPagos}
                  onChange={(event) => setClaseSeleccionadaPagos(event.target.value)}
                >
                  {opcionesClasePagos.map((opcion) => (
                    <option key={opcion.claseId} value={opcion.claseId}>{opcion.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="alumno-detalle-payment-table">
              {mesesPago.map((mes) => {
                const estado = getEstadoPago(mes)
                const botonEstado = getBotonEstado(estado)

                return (
                  <div key={mes} className="responsive-inline-grid responsive-inline-grid--2 alumno-detalle-payment-row">
                    <div className="alumno-detalle-payment-top-row">
                      <div className="alumno-detalle-payment-info">
                        <p className="alumno-detalle-payment-month">{mes}</p>
                      </div>
                      <button
                        type="button"
                        className={`alumno-detalle-payment-button ${botonEstado.clase}`}
                        onClick={() => onActualizarEstadoPago(alumno.id, mes, botonEstado.siguienteEstado, claseSeleccionadaPagos)}
                      >
                        {botonEstado.texto}
                      </button>
                    </div>
                    <div>
                      <label className="alumno-detalle-payment-label">Modo de pago</label>
                      <select
                        className="alumno-detalle-payment-select"
                        value={getMetodoPagoMes(mes)}
                        onChange={(event) => onActualizarMetodoPago(alumno.id, mes, event.target.value, claseSeleccionadaPagos)}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="cuentaBancaria">Cuenta bancaria</option>
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AlumnoDetallePanel