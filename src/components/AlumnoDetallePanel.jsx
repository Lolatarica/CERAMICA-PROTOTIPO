import React, { useMemo, useState } from 'react'
import CalendarioCupos from './CalendarioCupos'
import { formatClassTimeRange } from '../utils/timeFormat'
import { DIAS_SEMANA, HORAS_BASE, ordenarHoras } from '../utils/agendaConfig'

function AlumnoDetallePanel({
  alumno,
  clases,
  sucursales,
  turnosPorSucursalYClase,
  pagosAlumno,
  mesesPago,
  onActualizarEstadoPago,
  onActualizarMetodoPago,
  onClose,
  onAgregarAsignacion,
  onQuitarAsignacion,
}) {
  const [detalleAsignacion, setDetalleAsignacion] = useState({ sucursalId: '', claseId: '', turnoId: '' })

  const asignaciones = useMemo(() => {
    if (Array.isArray(alumno?.asignaciones) && alumno.asignaciones.length > 0) {
      return alumno.asignaciones.filter((asignacion) => asignacion?.sucursalId && asignacion?.claseId && asignacion?.turnoId)
    }

    if (alumno?.sucursalId && alumno?.claseId && alumno?.turnoId) {
      return [{ sucursalId: alumno.sucursalId, claseId: alumno.claseId, turnoId: alumno.turnoId }]
    }

    return []
  }, [alumno])

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

  const getEstadoPago = (mes) => pagosAlumno?.meses?.[mes] || 'pendiente'
  const getMetodoPagoMes = (mes) => pagosAlumno?.metodosPagoPorMes?.[mes] || 'efectivo'

  const getBotonEstado = (estado) => {
    if (estado === 'pagado') {
      return {
        texto: 'Pago',
        siguienteEstado: 'pendiente',
        backgroundColor: '#6f9f72',
        color: 'white',
        boxShadow: '0 10px 18px rgba(111, 159, 114, 0.24)',
      }
    }

    if (estado === 'esperandoComprobante') {
      return {
        texto: 'Comprobante inicial',
        siguienteEstado: 'pendiente',
        backgroundColor: '#d9eef7',
        color: '#205b73',
        boxShadow: '0 8px 18px rgba(120, 180, 206, 0.24)',
        fontSize: '12px',
      }
    }

    return {
      texto: 'Deuda',
      siguienteEstado: 'pagado',
      backgroundColor: '#b75b52',
      color: 'white',
      boxShadow: '0 10px 18px rgba(183, 91, 82, 0.24)',
    }
  }

  const styles = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(51, 38, 28, 0.48)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '18px' },
    modal: { width: '100%', maxWidth: '980px', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', backgroundColor: 'var(--color-crema)', borderRadius: '28px', padding: '24px 20px 22px' },
    header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' },
    closeButton: { padding: 0, border: 'none', backgroundColor: 'transparent', color: '#7a6754', cursor: 'pointer', fontSize: '28px', lineHeight: 1, width: '28px', height: '28px' },
    title: { margin: 0, color: 'var(--color-marron-oscuro)', fontSize: '28px', lineHeight: 1.05 },
    subtitle: { margin: '8px 0 0 0', color: '#7a6754', fontSize: '14px' },
    section: { marginTop: '22px' },
    sectionTitle: { margin: '0 0 10px 0', color: '#2f261e', fontSize: '16px', fontWeight: '700' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
    infoBlock: { backgroundColor: '#f3eadf', borderRadius: '18px', padding: '14px 16px' },
    infoLabel: { display: 'block', fontSize: '11px', color: '#8c7a66', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
    infoValue: { display: 'block', fontSize: '15px', color: '#2f261e', fontWeight: '700', wordBreak: 'break-word' },
    assignmentList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    assignmentCard: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f3eadf', borderRadius: '18px', padding: '14px 16px', width: '100%' },
    assignmentBody: { flex: 1, minWidth: 0 },
    assignmentClass: { margin: 0, color: '#2f261e', fontWeight: '700', fontSize: '16px', textTransform: 'capitalize' },
    assignmentMeta: { margin: '4px 0 0 0', color: '#6f6254', fontSize: '13px' },
    removeButton: { width: '36px', height: '36px', padding: 0, borderRadius: '50%', border: '1px solid #d5c2ac', backgroundColor: 'white', color: '#4e3828', fontSize: '25px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    emptyState: { margin: 0, backgroundColor: '#f3eadf', borderRadius: '18px', padding: '14px 16px', color: '#6f6254', fontSize: '14px' },
    assignBox: { backgroundColor: '#f3eadf', borderRadius: '22px', padding: '16px' },
    label: { display: 'block', fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '8px' },
    select: { width: '100%', padding: '12px 15px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', backgroundColor: 'var(--color-blanco)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none' },
    helper: { margin: '0 0 12px 0', fontSize: '13px', color: '#6f6254', lineHeight: '1.4' },
    calendarShell: { width: '100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fffaf4', boxShadow: '0 10px 24px rgba(93, 77, 66, 0.08)', marginBottom: '14px' },
    addButton: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
    paymentBox: { backgroundColor: '#f3eadf', borderRadius: '22px', padding: '16px' },
    paymentTable: { display: 'flex', flexDirection: 'column', gap: '8px' },
    paymentRow: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fbf6ef', borderRadius: '14px', padding: '12px 14px' },
    paymentTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    paymentInfo: { flex: 1, minWidth: 0 },
    paymentMonth: { margin: 0, color: '#2f261e', fontSize: '14px', fontWeight: '700' },
    paymentLabel: { display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-marron-oscuro)', marginBottom: '8px' },
    paymentSelect: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', color: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none' },
    paymentButton: { minWidth: '132px', padding: '12px 14px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', flexShrink: 0 },
  }

  return (
    <div style={styles.overlay}>
      <style>{`.alumno-detalle-panel::-webkit-scrollbar{display:none;}`}</style>
      <div className="alumno-detalle-panel" style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>{alumno.nombre}</h3>
            <p style={styles.subtitle}>Detalle del alumno</p>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose} aria-label="Cerrar detalle">
            ×
          </button>
        </div>

        <section style={styles.section}>
          <div className="responsive-inline-grid responsive-inline-grid--2" style={styles.infoGrid}>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Telefono</span>
              <span style={styles.infoValue}>{alumno.tel || 'Sin dato'}</span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Mail</span>
              <span style={styles.infoValue}>{alumno.mail || 'Sin dato'}</span>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Clases asignadas</h4>
          <div style={styles.assignmentList}>
            {asignaciones.length === 0 ? (
              <p style={styles.emptyState}>Todavia no tiene clases asignadas.</p>
            ) : (
              asignaciones.map((asignacion) => {
                const detalle = getDescripcionAsignacion(asignacion)

                return (
                  <div key={`${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} style={styles.assignmentCard}>
                    <div style={styles.assignmentBody}>
                      <p style={styles.assignmentClass}>{detalle.clase}</p>
                      <p style={styles.assignmentMeta}>{detalle.sucursal}</p>
                      <p style={styles.assignmentMeta}>{detalle.horario}</p>
                    </div>
                    <button
                      type="button"
                      style={styles.removeButton}
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
          <section style={styles.section}>
            <h4 style={styles.sectionTitle}>Asignar otra clase</h4>
            <div style={styles.assignBox}>
              <label style={styles.label}>Sucursal</label>
              <select
                style={styles.select}
                value={detalleAsignacion.sucursalId}
                onChange={(event) => handleChangeDetalleAsignacion('sucursalId', event.target.value)}
              >
                <option value="">Selecciona una sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                ))}
              </select>

              <label style={styles.label}>Taller</label>
              <select
                style={styles.select}
                value={detalleAsignacion.claseId}
                onChange={(event) => handleChangeDetalleAsignacion('claseId', event.target.value)}
                disabled={!detalleAsignacion.sucursalId}
              >
                <option value="">Selecciona un taller</option>
                {clases.map((clase) => (
                  <option key={clase.id} value={clase.id}>{clase.nombre}</option>
                ))}
              </select>

              <label style={styles.label}>Calendario</label>
              <p style={styles.helper}>Elegi el dia y horario tocando una celda disponible.</p>
              <div style={styles.calendarShell}>
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

              <button type="button" style={styles.addButton} onClick={handleAgregarAsignacion}>
                Asignar clase
              </button>
            </div>
          </section>
        )}

        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Calendario de pagos</h4>
          <div style={styles.paymentBox}>
            <div style={styles.paymentTable}>
              {mesesPago.map((mes) => {
                const estado = getEstadoPago(mes)
                const botonEstado = getBotonEstado(estado)

                return (
                  <div key={mes} className="responsive-inline-grid responsive-inline-grid--2" style={styles.paymentRow}>
                    <div style={styles.paymentTopRow}>
                      <div style={styles.paymentInfo}>
                        <p style={styles.paymentMonth}>{mes}</p>
                      </div>
                      <button
                        type="button"
                        style={{ ...styles.paymentButton, ...botonEstado }}
                        onClick={() => onActualizarEstadoPago(alumno.id, mes, botonEstado.siguienteEstado)}
                      >
                        {botonEstado.texto}
                      </button>
                    </div>
                    <div>
                      <label style={styles.paymentLabel}>Modo de pago</label>
                      <select
                        style={styles.paymentSelect}
                        value={getMetodoPagoMes(mes)}
                        onChange={(event) => onActualizarMetodoPago(alumno.id, mes, event.target.value)}
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
