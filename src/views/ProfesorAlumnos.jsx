// src/views/ProfesorAlumnos.jsx
import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import AlumnoDetallePanel from '../components/AlumnoDetallePanel';
import InputSimple from '../components/InputSimple';
import { DIAS_SEMANA } from '../utils/agendaConfig';
import { formatClassTimeRange } from '../utils/timeFormat';

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
    tarjetaAlumno: {
      backgroundColor: 'white', padding: '20px', borderRadius: '18px', marginBottom: '18px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.08)', position: 'relative',
      cursor: 'pointer'
    },
    nombre: { fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#333' },
    dato: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: '4px 0', color: '#222' },
    iconoDato: { width: '16px', height: '16px', color: '#111', flexShrink: 0 },
    asignacionesLista: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', width: '100%' },
    asignacionItem: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f7f0e6', borderRadius: '14px', padding: '10px 12px' },
    asignacionTexto: { flex: 1, minWidth: 0, padding: '2px 0', color: '#2f261e' },
    asignacionClase: { margin: 0, fontSize: '13px', fontWeight: '700', color: '#2f261e', lineHeight: '1.35' },
    asignacionMeta: { margin: '3px 0 0 0', fontSize: '12px', color: '#6f6254', lineHeight: '1.35' },
    botonQuitarAsignacion: { width: '34px', height: '34px', padding: 0, borderRadius: '50%', border: '1px solid #d5c2ac', backgroundColor: 'white', color: '#4e3828', fontSize: '24px', fontWeight: '700', lineHeight: '1', cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    textoSinClase: { marginTop: '12px', fontSize: '13px', color: '#8a7a6d' },
    botonesTarjeta: { display: 'flex', flexDirection: 'column', gap: '10px', position: 'absolute', right: '15px', top: '15px', width: '56px' },
    botonEditar: {
      width: '56px',
      height: '56px',
      padding: '0',
      backgroundColor: 'var(--color-marron-oscuro)',
      color: 'white',
      border: 'none',
      borderRadius: '18px',
      cursor: 'pointer',
      boxShadow: '0 16px 32px rgba(0,0,0,0.14)',
      display: 'grid',
      placeItems: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    iconoBotonEditar: { width: '24px', height: '24px', display: 'block' },
    botonAgregarAlumno: {
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      width: '62px',
      height: '62px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: 'var(--color-marron-oscuro)',
      color: 'white',
      fontSize: '34px',
      lineHeight: '1',
      cursor: 'pointer',
      boxShadow: '0 18px 34px rgba(0,0,0,0.22)',
      zIndex: 60,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlayEdicion: { position: 'fixed', inset: 0, backgroundColor: 'rgba(51, 38, 28, 0.48)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '18px' },
    modalEdicion: { width: '100%', maxWidth: '560px', backgroundColor: 'var(--color-crema)', borderRadius: '28px', padding: '24px 20px 22px', boxShadow: '0 22px 40px rgba(0,0,0,0.18)' },
    headerModal: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' },
    tituloModal: { margin: 0, color: 'var(--color-marron-oscuro)', fontSize: '28px', lineHeight: '1.05' },
    subtituloModal: { margin: '8px 0 0 0', color: '#7a6754', fontSize: '14px' },
    cerrarModal: { padding: 0, border: 'none', backgroundColor: 'transparent', color: '#7a6754', cursor: 'pointer', fontSize: '28px', lineHeight: 1, width: '28px', height: '28px' },
    etiquetaForm: { display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#333' },
    selectFormulario: { width: '100%', padding: '12px 15px', borderRadius: '16px', border: '1px solid #e7dfd5', backgroundColor: 'var(--color-blanco)', fontSize: '16px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)', marginBottom: '6px', color: '#4b4138' },
    selectFormularioError: { border: '1px solid #d93025' },
    textoError: { color: '#d93025', fontSize: '13px', margin: '0 0 18px 0' },
    accionesModal: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' },
    botonModalSecundario: { width: '100%', padding: '15px', backgroundColor: '#e9dcc9', color: 'var(--color-marron-oscuro)', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.16)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
    botonModalPrincipal: { width: '100%', padding: '15px', backgroundColor: 'var(--color-marron-oscuro)', color: 'var(--color-blanco)', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Agenda de Alumnos</h2>

        <section className="filter-grid filter-grid--2 filter-grid--3" style={styles.seccionFiltros}>
          <input
            style={styles.inputBusqueda}
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div style={styles.filaSelects}>
            <select style={styles.selectFiltro} value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
              <option value="todas">Todas las clases</option>
              {clases.map((clase) => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
            <select style={styles.selectFiltro} value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
              <option value="todos">Todos los dias</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>
        </section>

        <div style={{ paddingBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Mostrando {alumnosFiltrados.length} alumnos
          </p>

          {alumnosFiltrados.map((alumno) => (
            <div
              key={alumno.id}
              style={styles.tarjetaAlumno}
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
              <h3 style={styles.nombre}>{alumno.nombre}</h3>
              <p style={styles.dato}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconoDato}>
                  <path d="M6.6 3h2.5c.4 0 .8.3.9.7l.6 2.6c.1.4 0 .8-.3 1.1l-1.4 1.4a14.8 14.8 0 0 0 6 6l1.4-1.4c.3-.3.7-.4 1.1-.3l2.6.6c.4.1.7.5.7.9v2.5c0 .6-.4 1-.9 1.1-.7.1-1.4.2-2.1.2C10 21 3 14 3 5.5c0-.7.1-1.4.2-2.1.1-.5.5-.9 1.1-.9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {alumno.tel}
              </p>
              <p style={styles.dato}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconoDato}>
                  <path d="M4 6.5h16c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-9c0-.6.4-1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m4 8 8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {alumno.mail}
              </p>

              {obtenerAsignaciones(alumno).length > 0 ? (
                <div style={styles.asignacionesLista}>
                  {obtenerAsignaciones(alumno).map((asignacion) => {
                    const detalle = describirAsignacion(asignacion);

                    return (
                      <div key={`${alumno.id}-${asignacion.sucursalId}-${asignacion.claseId}-${asignacion.turnoId}`} style={styles.asignacionItem}>
                        <div style={styles.asignacionTexto}>
                          <p style={styles.asignacionClase}>{detalle.clase}</p>
                          <p style={styles.asignacionMeta}>{detalle.sucursal}</p>
                          <p style={styles.asignacionMeta}>{detalle.dia} {detalle.horario}</p>
                        </div>
                        <button
                          type="button"
                          style={styles.botonQuitarAsignacion}
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
                <p style={styles.textoSinClase}>Todavia no tiene clases asignadas.</p>
              )}

              <div style={styles.botonesTarjeta}>
                <button
                  type="button"
                  style={styles.botonEditar}
                  title="Editar"
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirEdicionAlumno(alumno);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconoBotonEditar}>
                    <path d="M4 20h3.8l9.7-9.7-3.8-3.8L4 16.2V20Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                    <path d="M12.9 7.1 16.7 11" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20h5.2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {alumnosFiltrados.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>No se encontraron alumnos con esos filtros.</p>
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
        style={styles.botonAgregarAlumno}
        aria-label="Agregar alumno nuevo"
        title="Agregar alumno"
        onClick={abrirNuevoAlumno}
      >
        +
      </button>

      {formAlumno && (
        <div style={styles.overlayEdicion}>
          <div style={styles.modalEdicion}>
            <div style={styles.headerModal}>
              <div>
                <h3 style={styles.tituloModal}>{formAlumno.id ? 'Editar alumno' : 'Nuevo alumno'}</h3>
                <p style={styles.subtituloModal}>{formAlumno.id ? 'Modifica los datos del alumno desde el lapiz.' : 'Crea un alumno nuevo para sumarlo a la agenda.'}</p>
              </div>
              <button type="button" style={styles.cerrarModal} onClick={cerrarEdicionAlumno} aria-label="Cerrar edicion">
                ×
              </button>
            </div>

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

            {!formAlumno.id && (
              <>
                <label style={styles.etiquetaForm}>Sucursal</label>
                <select
                  style={{
                    ...styles.selectFormulario,
                    ...(erroresFormAlumno.sucursalId ? styles.selectFormularioError : {}),
                  }}
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
                {erroresFormAlumno.sucursalId ? <p style={styles.textoError}>{erroresFormAlumno.sucursalId}</p> : null}

                <label style={styles.etiquetaForm}>Taller</label>
                <select
                  style={{
                    ...styles.selectFormulario,
                    ...(erroresFormAlumno.claseId ? styles.selectFormularioError : {}),
                  }}
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
                {erroresFormAlumno.claseId ? <p style={styles.textoError}>{erroresFormAlumno.claseId}</p> : null}

                <label style={styles.etiquetaForm}>Horario existente</label>
                <select
                  style={{
                    ...styles.selectFormulario,
                    ...(erroresFormAlumno.turnoId ? styles.selectFormularioError : {}),
                  }}
                  value={formAlumno.turnoId || ''}
                  onChange={(event) => actualizarCampoAlumno('turnoId', event.target.value)}
                  disabled={!formAlumno.claseId}
                >
                  <option value="">Sin asignación</option>
                  {turnosDisponiblesNuevoAlumno.map((turno) => (
                    <option key={turno.turnoId} value={turno.turnoId}>{turno.label}</option>
                  ))}
                </select>
                {erroresFormAlumno.turnoId ? <p style={styles.textoError}>{erroresFormAlumno.turnoId}</p> : null}
              </>
            )}

            <div style={styles.accionesModal}>
              <button type="button" style={styles.botonModalSecundario} onClick={cerrarEdicionAlumno}>
                Cancelar
              </button>
              <button type="button" style={styles.botonModalPrincipal} onClick={guardarAlumnoEditado}>
                {formAlumno.id ? 'Guardar cambios' : 'Guardar alumno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfesorAlumnos;
