// src/views/ProfesorPagos.jsx
import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import AlumnoDetallePanel from '../components/AlumnoDetallePanel';
import { formatClassTimeRange } from '../utils/timeFormat';
import './ProfesorPagos.css'; // <-- Acordate de crear e importar este archivo

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

  return (
    <div className="app-shell app-shell--wide pagos-container">
      <header className="app-header pagos-header">
        <div className="pagos-title-row">
          <button type="button" className="pagos-back-button" onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="pagos-title">Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" className="pagos-logo" />
      </header>

      <main className="app-main content-shell content-shell--xl pagos-body">
        <h2 className="pagos-titulo-seccion">Control de Pagos</h2>

        <section className="filter-grid filter-grid--2 filter-grid--3 pagos-seccion-filtros">
          <input
            className="pagos-input-busqueda"
            placeholder="Buscar alumno por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="pagos-fila-selects">
            <select className="pagos-select-filtro" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
              {mesesPago.map((mes) => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
            <select className="pagos-select-filtro" value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
              <option value="todas">Todas las clases</option>
              {clases.map((clase) => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
          </div>
          <button
            className={`pagos-btn-pendientes ${verSoloPendientes ? 'pagos-btn-pendientes--activo' : 'pagos-btn-pendientes--inactivo'}`}
            onClick={() => setVerSoloPendientes(!verSoloPendientes)}
          >
            {verSoloPendientes ? 'Viendo solo deuda y comprobantes' : 'Ver todos los estados'}
          </button>
        </section>

        <div className="pagos-lista-contenedor">
          <p className="pagos-resultados-txt">
            Resultados: {resumenPagos.length} alumnos
          </p>

          {resumenPagos.map(({ alumno, estado, metodoPago, asignaciones }) => {
            const esPagado = estado === 'pagado';
            const esEsperandoComprobante = estado === 'esperandoComprobante';
            
            let badgeClass = 'pagos-estado-badge--deuda';
            if (esPagado) badgeClass = 'pagos-estado-badge--pagado';
            else if (esEsperandoComprobante) badgeClass = 'pagos-estado-badge--revisar';

            return (
              <div key={alumno.id} className="pagos-tarjeta-pago" onClick={() => setAlumnoDetalleId(alumno.id)}>
                <div className="pagos-info-alumno">
                  <h3 className="pagos-nombre">{alumno.nombre}</h3>
                  <span className={`pagos-estado-badge ${badgeClass}`}>
                    {esPagado ? 'PAGO' : esEsperandoComprobante ? 'REVISAR' : 'DEUDA'}
                  </span>
                </div>

                <div className="pagos-asignaciones-lista">
                  {asignaciones.length > 0 ? asignaciones.map((asignacion) => {
                    const detalle = describirAsignacion(asignacion);

                    return (
                      <div key={`${alumno.id}-${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} className="pagos-asignacion-item">
                        <p className="pagos-clase-txt">{detalle.clase}</p>
                        <p className="pagos-meta-txt">{detalle.sucursal}</p>
                        <p className="pagos-meta-txt">{detalle.horario}</p>
                      </div>
                    );
                  }) : (
                    <div className="pagos-asignacion-item">
                      <p className="pagos-clase-txt">Sin clase asignada</p>
                    </div>
                  )}
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                  <label className="pagos-label-metodo-pago">Modo de pago</label>
                  <select
                    className="pagos-select-metodo-pago"
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
                      className="pagos-boton-comprobante-inicial"
                      onClick={() => onActualizarEstadoPago?.(alumno.id, filtroMes, 'pendiente')}
                    >
                      Comprobante inicial
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`pagos-boton-toggle-pago ${esPagado ? 'pagos-boton-toggle-pago--pagado' : 'pagos-boton-toggle-pago--deuda'}`}
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
            <p className="pagos-empty-state">
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