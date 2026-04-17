// src/views/ProfesorPagos.jsx
import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import AlumnoDetallePanel from '../components/AlumnoDetallePanel';
import { formatClassTimeRange } from '../utils/timeFormat';

function ProfesorPagos({
  alumnos = [],
  clases = [],
  sucursales = [],
  turnosPorSucursalYClase = {},
  pagosAlumnos = {},
  mesesPago = [],
  onAgregarAsignacion,
  onDesasignarAlumno,
  onActualizarEstadoPago,
  onActualizarMetodoPago,
  onVolver,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroClase, setFiltroClase] = useState('todas');
  const [filtroMes, setFiltroMes] = useState(mesesPago[0] || '');
  const [verSoloPendientes, setVerSoloPendientes] = useState(false);
  const [alumnoDetalleId, setAlumnoDetalleId] = useState(null);

  const alumnoSeleccionado = useMemo(
    () => alumnos.find((alumno) => alumno.id === alumnoDetalleId) || null,
    [alumnos, alumnoDetalleId]
  );

  const obtenerAsignaciones = (alumno) => {
    if (Array.isArray(alumno?.asignaciones) && alumno.asignaciones.length > 0) {
      return alumno.asignaciones.filter((asignacion) => asignacion?.sucursalId && asignacion?.claseId && asignacion?.turnoId);
    }

    if (alumno?.sucursalId && alumno?.claseId && alumno?.turnoId) {
      return [{ sucursalId: alumno.sucursalId, claseId: alumno.claseId, turnoId: alumno.turnoId }];
    }

    return [];
  };

  const describirAsignacion = (asignacion) => {
    const clase = clases.find((item) => item.id === asignacion.claseId)?.nombre || asignacion.claseId;
    const sucursal = sucursales.find((item) => item.id === asignacion.sucursalId)?.nombre || asignacion.sucursalId;
    const [dia, hora] = asignacion.turnoId.split('-');

    return {
      clase,
      sucursal,
      horario: `${dia} ${formatClassTimeRange(hora)}`,
    };
  };

  const resumenPagos = useMemo(() => {
    return alumnos.map((alumno) => {
      const estado = pagosAlumnos[alumno.id]?.meses?.[filtroMes] || 'pendiente';
      const metodoPago = pagosAlumnos[alumno.id]?.metodosPagoPorMes?.[filtroMes] || 'efectivo';
      const asignaciones = obtenerAsignaciones(alumno);

      return {
        alumno,
        estado,
        metodoPago,
        asignaciones,
      };
    }).filter(({ alumno, estado, asignaciones }) => {
      const textoBusqueda = busqueda.trim().toLowerCase();
      const coincideBusqueda = !textoBusqueda || [alumno.nombre, alumno.tel, alumno.mail].some((valor) => (valor || '').toLowerCase().includes(textoBusqueda));
      const coincideClase = filtroClase === 'todas' || asignaciones.some((asignacion) => asignacion.claseId === filtroClase);
      const esPendiente = estado === 'pendiente' || estado === 'esperandoComprobante';
      const coincidePendiente = verSoloPendientes ? esPendiente : true;

      return coincideBusqueda && coincideClase && coincidePendiente;
    });
  }, [alumnos, busqueda, filtroClase, filtroMes, pagosAlumnos, verSoloPendientes]);

  const toggleEstadoPago = (alumnoId, estadoActual) => {
    const siguienteEstado = estadoActual === 'pagado' ? 'pendiente' : 'pagado';
    onActualizarEstadoPago?.(alumnoId, filtroMes, siguienteEstado);
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: '0 auto', backgroundColor: 'var(--color-crema)', position: 'relative' },
    header: { backgroundColor: 'var(--color-marron-oscuro)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { color: '#E0C9A6', fontFamily: 'var(--font-titulo)', fontSize: '24px', margin: 0 },
    backButton: { width: '24px', height: '24px', padding: 0, border: 'none', backgroundColor: 'transparent', color: '#E0C9A6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logo: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'cover' },
    body: { padding: '20px', flex: 1 },
    seccionFiltros: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
    inputBusqueda: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'var(--font-principal)' },
    filaSelects: { display: 'flex', gap: '10px' },
    selectFiltro: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd', backgroundColor: 'white', fontSize: '16px', fontFamily: 'var(--font-principal)' },
    btnPendientes: { padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s ease' },
    tarjetaPago: { backgroundColor: 'white', padding: '18px', borderRadius: '18px', marginBottom: '14px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' },
    infoAlumno: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
    nombre: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#333' },
    estadoBadge: { fontSize: '11px', fontWeight: '800', padding: '6px 10px', borderRadius: '999px', flexShrink: 0 },
    asignacionesLista: { display: 'flex', flexDirection: 'column', gap: '8px' },
    asignacionItem: { backgroundColor: '#f7f0e6', borderRadius: '14px', padding: '12px 14px' },
    claseTxt: { fontSize: '13px', color: '#2f261e', margin: 0, fontWeight: '700' },
    metaTxt: { fontSize: '12px', color: '#6f6254', margin: '4px 0 0 0' },
    labelMetodoPago: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#6f6254', margin: '10px 0 6px 0' },
    selectMetodoPago: { width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #ddd', backgroundColor: 'white', fontSize: '14px', color: '#333' },
    botonTogglePago: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer' },
    botonComprobanteInicial: { width: '100%', padding: '9px 8px', minHeight: '56px', borderRadius: '14px', border: 'none', backgroundColor: '#d9eef7', color: '#205b73', fontWeight: '800', fontSize: '11px', lineHeight: '1.15', cursor: 'pointer', boxShadow: '0 8px 18px rgba(120, 180, 206, 0.24)' },
  };

  return (
    <div className="app-shell app-shell--wide" style={styles.container}>
      <header className="app-header" style={styles.header}>
        <div style={styles.titleRow}>
          <button type="button" style={styles.backButton} onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={styles.title}>Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" style={styles.logo} />
      </header>

      <main className="app-main content-shell content-shell--xl" style={styles.body}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Control de Pagos</h2>

        <section className="filter-grid filter-grid--2 filter-grid--3" style={styles.seccionFiltros}>
          <input
            style={styles.inputBusqueda}
            placeholder="Buscar alumno por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div style={styles.filaSelects}>
            <select style={styles.selectFiltro} value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
              {mesesPago.map((mes) => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
            <select style={styles.selectFiltro} value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
              <option value="todas">Todas las clases</option>
              {clases.map((clase) => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
          </div>
          <button
            style={{
              ...styles.btnPendientes,
              backgroundColor: verSoloPendientes ? '#A95C5C' : '#EAEAEA',
              color: verSoloPendientes ? 'white' : '#666'
            }}
            onClick={() => setVerSoloPendientes(!verSoloPendientes)}
          >
            {verSoloPendientes ? 'Viendo solo deuda y comprobantes' : 'Ver todos los estados'}
          </button>
        </section>

        <div>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Resultados: {resumenPagos.length} alumnos
          </p>

          {resumenPagos.map(({ alumno, estado, metodoPago, asignaciones }) => {
            const esPagado = estado === 'pagado';
            const esEsperandoComprobante = estado === 'esperandoComprobante';
            const badgeStyle = esPagado
              ? { backgroundColor: '#E8F5E9', color: '#2E7D32' }
              : esEsperandoComprobante
                ? { backgroundColor: '#FFF8E1', color: '#F57F17' }
                : { backgroundColor: '#FFEBEE', color: '#C62828' };

            return (
              <div key={alumno.id} style={styles.tarjetaPago} onClick={() => setAlumnoDetalleId(alumno.id)}>
                <div style={styles.infoAlumno}>
                  <h3 style={styles.nombre}>{alumno.nombre}</h3>
                  <span style={{ ...styles.estadoBadge, ...badgeStyle }}>
                    {esPagado ? 'PAGO' : esEsperandoComprobante ? 'REVISAR' : 'DEUDA'}
                  </span>
                </div>

                <div style={styles.asignacionesLista}>
                  {asignaciones.length > 0 ? asignaciones.map((asignacion) => {
                    const detalle = describirAsignacion(asignacion);

                    return (
                      <div key={`${alumno.id}-${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} style={styles.asignacionItem}>
                        <p style={styles.claseTxt}>{detalle.clase}</p>
                        <p style={styles.metaTxt}>{detalle.sucursal}</p>
                        <p style={styles.metaTxt}>{detalle.horario}</p>
                      </div>
                    );
                  }) : (
                    <div style={styles.asignacionItem}>
                      <p style={styles.claseTxt}>Sin clase asignada</p>
                    </div>
                  )}
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                  <label style={styles.labelMetodoPago}>Modo de pago</label>
                  <select
                    style={styles.selectMetodoPago}
                    value={metodoPago}
                    onChange={(event) => onActualizarMetodoPago?.(alumno.id, filtroMes, event.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="cuentaBancaria">Cuenta bancaria</option>
                  </select>
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                  {esEsperandoComprobante ? (
                    <button
                      type="button"
                      style={styles.botonComprobanteInicial}
                      onClick={() => onActualizarEstadoPago?.(alumno.id, filtroMes, 'pendiente')}
                    >
                      Comprobante inicial
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={{
                        ...styles.botonTogglePago,
                        backgroundColor: esPagado ? '#6f9f72' : '#b75b52',
                        color: 'white',
                        boxShadow: esPagado
                          ? '0 10px 18px rgba(111, 159, 114, 0.24)'
                          : '0 10px 18px rgba(183, 91, 82, 0.24)',
                      }}
                      onClick={() => toggleEstadoPago(alumno.id, estado)}
                    >
                      {esPagado ? 'Pago' : 'Deuda'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {resumenPagos.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '30px', color: '#999' }}>
              No se encontraron coincidencias.
            </p>
          )}
        </div>
      </main>

      {alumnoSeleccionado && (
        <AlumnoDetallePanel
          alumno={alumnoSeleccionado}
          clases={clases}
          sucursales={sucursales}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          pagosAlumno={pagosAlumnos[alumnoSeleccionado.id]}
          mesesPago={mesesPago}
          onAgregarAsignacion={(nuevaAsignacion) => onAgregarAsignacion?.(alumnoSeleccionado.id, nuevaAsignacion)}
          onActualizarEstadoPago={onActualizarEstadoPago}
          onActualizarMetodoPago={onActualizarMetodoPago}
          onQuitarAsignacion={(asignacion) => onDesasignarAlumno?.(alumnoSeleccionado.id, asignacion)}
          onClose={() => setAlumnoDetalleId(null)}
        />
      )}
    </div>
  );
}

export default ProfesorPagos;