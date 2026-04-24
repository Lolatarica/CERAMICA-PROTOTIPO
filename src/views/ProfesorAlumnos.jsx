// src/views/ProfesorAlumnos.jsx
import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import AlumnoDetallePanel from '../components/AlumnoDetallePanel';
import InputSimple from '../components/InputSimple';
import { DIAS_SEMANA } from '../utils/agendaConfig';
import { formatClassTimeRange } from '../utils/timeFormat';
import './ProfesorAlumnos.css'; // <-- Acordate de crear e importar este archivo

function ProfesorAlumnos({
  alumnos = [],
  clases = [],
  sucursales = [],
  turnosPorSucursalYClase = {},
  pagosAlumnos = {},
  mesesPago = [],
  onAgregarAsignacion,
  onGuardarAlumno,
  onDesasignarAlumno,
  onActualizarEstadoPago,
  onActualizarMetodoPago,
  onVolver,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroClase, setFiltroClase] = useState('todas');
  const [filtroDia, setFiltroDia] = useState('todos');
  const [alumnoDetalleId, setAlumnoDetalleId] = useState(null);
  const [alumnoEditandoId, setAlumnoEditandoId] = useState(null);
  const [formAlumno, setFormAlumno] = useState(null);
  const [erroresFormAlumno, setErroresFormAlumno] = useState({});

  const alumnoSeleccionado = useMemo(
    () => alumnos.find((alumno) => alumno.id === alumnoDetalleId) || null,
    [alumnos, alumnoDetalleId]
  );

  const alumnoEditando = useMemo(
    () => alumnos.find((alumno) => alumno.id === alumnoEditandoId) || null,
    [alumnos, alumnoEditandoId]
  );

  const turnosDisponiblesNuevoAlumno = useMemo(() => {
    if (!formAlumno?.sucursalId || !formAlumno?.claseId) {
      return [];
    }

    return Object.keys(turnosPorSucursalYClase[formAlumno.sucursalId]?.[formAlumno.claseId] || {})
      .map((turnoId) => {
        const [dia, hora] = turnoId.split('-');

        return {
          turnoId,
          label: `${dia} ${formatClassTimeRange(hora)}`,
        };
      });
  }, [formAlumno?.claseId, formAlumno?.sucursalId, turnosPorSucursalYClase]);

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
      dia,
      horario: formatClassTimeRange(hora),
    };
  };

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((alumno) => {
      const textoBusqueda = busqueda.trim().toLowerCase();
      const asignaciones = obtenerAsignaciones(alumno);
      const coincideBusqueda = !textoBusqueda || [alumno.nombre, alumno.tel, alumno.mail].some((valor) => (valor || '').toLowerCase().includes(textoBusqueda));
      const coincideClase = filtroClase === 'todas' || asignaciones.some((asignacion) => asignacion.claseId === filtroClase);
      const coincideDia = filtroDia === 'todos' || asignaciones.some((asignacion) => asignacion.turnoId.startsWith(`${filtroDia}-`));

      return coincideBusqueda && coincideClase && coincideDia;
    });
  }, [alumnos, busqueda, filtroClase, filtroDia]);

  const abrirDetalleAlumno = (alumnoId) => {
    setAlumnoDetalleId(alumnoId);
  };

  const abrirEdicionAlumno = (alumno) => {
    setAlumnoEditandoId(alumno.id);
    setErroresFormAlumno({});
    setFormAlumno({
      id: alumno.id,
      nombre: alumno.nombre || '',
      tel: alumno.tel || '',
      mail: alumno.mail || '',
      asignaciones: alumno.asignaciones,
      sucursalId: alumno.sucursalId,
      claseId: alumno.claseId,
      turnoId: alumno.turnoId,
    });
  };

  const abrirNuevoAlumno = () => {
    setAlumnoEditandoId('nuevo');
    setErroresFormAlumno({});
    setFormAlumno({
      id: null,
      nombre: '',
      tel: '',
      mail: '',
      asignaciones: [],
      sucursalId: '',
      claseId: '',
      turnoId: '',
    });
  };

  const cerrarEdicionAlumno = () => {
    setAlumnoEditandoId(null);
    setFormAlumno(null);
    setErroresFormAlumno({});
  };

  const limpiarErrorAlumno = (campo) => {
    setErroresFormAlumno((erroresActuales) => {
      if (!erroresActuales[campo]) {
        return erroresActuales;
      }

      return {
        ...erroresActuales,
        [campo]: null,
      };
    });
  };

  const actualizarCampoAlumno = (campo, valor) => {
    limpiarErrorAlumno(campo);
    setFormAlumno((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarAlumnoEditado = () => {
    const esNuevoAlumno = !formAlumno.id;
    const nuevosErrores = {
      nombre: !formAlumno?.nombre?.trim() ? 'Este casillero es obligatorio para continuar' : null,
      tel: !formAlumno?.tel?.trim() ? 'Este casillero es obligatorio para continuar' : null,
      mail: !formAlumno?.mail?.trim()
        ? 'Este casillero es obligatorio para continuar'
        : !formAlumno.mail.includes('@')
          ? 'El mail debe incluir una arroba (@)'
          : null,
      sucursalId: esNuevoAlumno && formAlumno?.claseId && !formAlumno?.sucursalId ? 'Selecciona una sucursal' : null,
      claseId: esNuevoAlumno && formAlumno?.sucursalId && !formAlumno?.claseId ? 'Selecciona un taller' : null,
      turnoId: esNuevoAlumno && formAlumno?.claseId && formAlumno?.sucursalId && !formAlumno?.turnoId ? 'Selecciona un horario' : null,
    };

    setErroresFormAlumno(nuevosErrores);

    if (Object.values(nuevosErrores).some(Boolean)) {
      return;
    }

    const asignacionNueva = formAlumno.sucursalId && formAlumno.claseId && formAlumno.turnoId
      ? [{
          sucursalId: formAlumno.sucursalId,
          claseId: formAlumno.claseId,
          turnoId: formAlumno.turnoId,
        }]
      : [];

    const guardadoOk = onGuardarAlumno?.({
      ...(alumnoEditando || {}),
      ...formAlumno,
      nombre: formAlumno.nombre.trim(),
      tel: formAlumno.tel.trim(),
      mail: formAlumno.mail.trim(),
      asignaciones: esNuevoAlumno ? asignacionNueva : alumnoEditando?.asignaciones,
      sucursalId: esNuevoAlumno ? (asignacionNueva[0]?.sucursalId || '') : alumnoEditando?.sucursalId,
      claseId: esNuevoAlumno ? (asignacionNueva[0]?.claseId || '') : alumnoEditando?.claseId,
      turnoId: esNuevoAlumno ? (asignacionNueva[0]?.turnoId || '') : alumnoEditando?.turnoId,
    });

    if (guardadoOk === false) {
      alert('No se pudieron guardar los cambios del alumno.');
      return;
    }

    cerrarEdicionAlumno();
  };

  return (
    <div className="app-shell app-shell--wide alumnos-container">
      <header className="app-header alumnos-header">
        <div className="alumnos-title-row">
          <button type="button" className="alumnos-back-button" onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="alumnos-title">Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" className="alumnos-logo" />
      </header>

      <main className="app-main content-shell content-shell--xl alumnos-body">
        <h2 className="alumnos-titulo-seccion">Agenda de Alumnos</h2>

        <section className="filter-grid filter-grid--2 filter-grid--3 alumnos-seccion-filtros">
          <input
            className="alumnos-input-busqueda"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="alumnos-fila-selects">
            <select className="alumnos-select-filtro" value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
              <option value="todas">Todas las clases</option>
              {clases.map((clase) => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
            <select className="alumnos-select-filtro" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
              <option value="todos">Todos los dias</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>
        </section>

        <div className="alumnos-lista-contenedor">
          <p className="alumnos-contador">
            Mostrando {alumnosFiltrados.length} alumnos
          </p>

          {alumnosFiltrados.map((alumno) => (
            <div
              key={alumno.id}
              className="alumnos-tarjeta-alumno"
              onClick={() => abrirDetalleAlumno(alumno.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  abrirDetalleAlumno(alumno.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalle de ${alumno.nombre}`}
            >
              <h3 className="alumnos-nombre">{alumno.nombre}</h3>
              <p className="alumnos-dato">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="alumnos-icono-dato">
                  <path d="M6.6 3h2.5c.4 0 .8.3.9.7l.6 2.6c.1.4 0 .8-.3 1.1l-1.4 1.4a14.8 14.8 0 0 0 6 6l1.4-1.4c.3-.3.7-.4 1.1-.3l2.6.6c.4.1.7.5.7.9v2.5c0 .6-.4 1-.9 1.1-.7.1-1.4.2-2.1.2C10 21 3 14 3 5.5c0-.7.1-1.4.2-2.1.1-.5.5-.9 1.1-.9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {alumno.tel}
              </p>
              <p className="alumnos-dato">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="alumnos-icono-dato">
                  <path d="M4 6.5h16c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-9c0-.6.4-1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m4 8 8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {alumno.mail}
              </p>

              {obtenerAsignaciones(alumno).length > 0 ? (
                <div className="alumnos-asignaciones-lista">
                  {obtenerAsignaciones(alumno).map((asignacion) => {
                    const detalle = describirAsignacion(asignacion);

                    return (
                      <div key={`${alumno.id}-${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} className="alumnos-asignacion-item">
                        <div className="alumnos-asignacion-texto">
                          <p className="alumnos-asignacion-clase">{detalle.clase}</p>
                          <p className="alumnos-asignacion-meta">{detalle.sucursal}</p>
                          <p className="alumnos-asignacion-meta">{detalle.dia} {detalle.horario}</p>
                        </div>
                        <button
                          type="button"
                          className="alumnos-boton-quitar-asignacion"
                          aria-label="Desagendar clase"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDesasignarAlumno?.(alumno.id, asignacion);
                          }}
                        >-</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="alumnos-texto-sin-clase">Todavia no tiene clases asignadas.</p>
              )}

              <div className="alumnos-botones-tarjeta">
                <button
                  type="button"
                  className="alumnos-boton-editar"
                  title="Editar"
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirEdicionAlumno(alumno);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="alumnos-icono-boton-editar">
                    <path d="M4 20h3.8l9.7-9.7-3.8-3.8L4 16.2V20Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                    <path d="M12.9 7.1 16.7 11" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20h5.2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {alumnosFiltrados.length === 0 && (
            <p className="alumnos-estado-vacio">No se encontraron alumnos con esos filtros.</p>
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

      <button
        type="button"
        className="alumnos-boton-agregar-alumno"
        aria-label="Agregar alumno nuevo"
        title="Agregar alumno"
        onClick={abrirNuevoAlumno}
      >
        +
      </button>


      {formAlumno && (
        <div className="alumnos-overlay-edicion">
          <div className="alumnos-modal-edicion">
            <div className="alumnos-header-modal">
              <div>
                <h3 className="alumnos-titulo-modal">{formAlumno.id ? 'Editar alumno' : 'Nuevo alumno'}</h3>
                <p className="alumnos-subtitulo-modal">{formAlumno.id ? 'Modifica los datos del alumno desde el lapiz.' : 'Crea un alumno nuevo para sumarlo a la agenda.'}</p>
              </div>
              <button type="button" className="alumnos-cerrar-modal" onClick={cerrarEdicionAlumno} aria-label="Cerrar edicion">
                ×
              </button>
            </div>

            {!formAlumno.id ? (
              <div className="alumnos-form-grid--crear">
                <InputSimple
                  label="Nombre *"
                  placeholder="Nombre del alumno"
                  value={formAlumno.nombre}
                  onChange={(event) => actualizarCampoAlumno('nombre', event.target.value)}
                  error={erroresFormAlumno.nombre}
                />
                <InputSimple
                  label="Teléfono *"
                  placeholder="Telefono del alumno"
                  value={formAlumno.tel}
                  onChange={(event) => actualizarCampoAlumno('tel', event.target.value)}
                  error={erroresFormAlumno.tel}
                />
                <InputSimple
                  label="Email *"
                  type="email"
                  placeholder="Mail del alumno"
                  value={formAlumno.mail}
                  onChange={(event) => actualizarCampoAlumno('mail', event.target.value)}
                  error={erroresFormAlumno.mail}
                />
                <label className="alumnos-etiqueta-form sucursal" htmlFor="sucursal">Sucursal</label>
                <select
                  id="sucursal"
                  className={`alumnos-select-formulario sucursal ${erroresFormAlumno.sucursalId ? 'alumnos-select-formulario--error' : ''}`}
                  value={formAlumno.sucursalId || ''}
                  onChange={(event) => {
                    limpiarErrorAlumno('sucursalId');
                    setFormAlumno((actual) => ({
                      ...actual,
                      sucursalId: event.target.value,
                      claseId: '',
                      turnoId: '',
                    }));
                  }}
                >
                  <option value="">Sin asignar</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                  ))}
                </select>
                {erroresFormAlumno.sucursalId ? <p className="alumnos-texto-error">{erroresFormAlumno.sucursalId}</p> : null}
                <label className="alumnos-etiqueta-form taller" htmlFor="taller">Taller</label>
                <select
                  id="taller"
                  className={`alumnos-select-formulario taller ${erroresFormAlumno.claseId ? 'alumnos-select-formulario--error' : ''}`}
                  value={formAlumno.claseId || ''}
                  onChange={(event) => {
                    limpiarErrorAlumno('claseId');
                    setFormAlumno((actual) => ({
                      ...actual,
                      claseId: event.target.value,
                      turnoId: '',
                    }));
                  }}
                  disabled={!formAlumno.sucursalId}
                >
                  <option value="">Seleccioná un taller</option>
                  {clases.map((clase) => (
                    <option key={clase.id} value={clase.id}>{clase.nombre}</option>
                  ))}
                </select>
                {erroresFormAlumno.claseId ? <p className="alumnos-texto-error">{erroresFormAlumno.claseId}</p> : null}
                <label className="alumnos-etiqueta-form horario" htmlFor="horario">Horario existente</label>
                <select
                  id="horario"
                  className={`alumnos-select-formulario horario ${erroresFormAlumno.turnoId ? 'alumnos-select-formulario--error' : ''}`}
                  value={formAlumno.turnoId || ''}
                  onChange={(event) => actualizarCampoAlumno('turnoId', event.target.value)}
                  disabled={!formAlumno.claseId}
                >
                  <option value="">Sin asignación</option>
                  {turnosDisponiblesNuevoAlumno.map((turno) => (
                    <option key={turno.turnoId} value={turno.turnoId}>{turno.label}</option>
                  ))}
                </select>
                {erroresFormAlumno.turnoId ? <p className="alumnos-texto-error">{erroresFormAlumno.turnoId}</p> : null}
                <div className="alumnos-acciones-modal">
                  <button type="button" className="alumnos-boton-modal-secundario" onClick={cerrarEdicionAlumno}>
                    Cancelar
                  </button>
                  <button type="button" className="alumnos-boton-modal-principal" onClick={guardarAlumnoEditado}>
                    Guardar alumno
                  </button>
                </div>
              </div>
            ) : (
              <div className="alumnos-form-grid--editar">
                <InputSimple
                  label="Nombre *"
                  placeholder="Nombre del alumno"
                  value={formAlumno.nombre}
                  onChange={(event) => actualizarCampoAlumno('nombre', event.target.value)}
                  error={erroresFormAlumno.nombre}
                />
                <InputSimple
                  label="Teléfono *"
                  placeholder="Telefono del alumno"
                  value={formAlumno.tel}
                  onChange={(event) => actualizarCampoAlumno('tel', event.target.value)}
                  error={erroresFormAlumno.tel}
                />
                <InputSimple
                  label="Email *"
                  type="email"
                  placeholder="Mail del alumno"
                  value={formAlumno.mail}
                  onChange={(event) => actualizarCampoAlumno('mail', event.target.value)}
                  error={erroresFormAlumno.mail}
                />
                <div className="alumnos-acciones-modal">
                  <button type="button" className="alumnos-boton-modal-secundario" onClick={cerrarEdicionAlumno}>
                    Cancelar
                  </button>
                  <button type="button" className="alumnos-boton-modal-principal" onClick={guardarAlumnoEditado}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfesorAlumnos;