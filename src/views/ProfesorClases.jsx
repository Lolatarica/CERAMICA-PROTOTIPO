// src/views/ProfesorClases.jsx
import React, { useEffect, useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import { DIAS_SEMANA, esHoraValida, obtenerDetalleTurno, OPCIONES_PUBLICO } from '../utils/agendaConfig';
import { formatTurnoId } from '../utils/timeFormat';

function ProfesorClases({
  alumnos,
  clases,
  sucursales,
  opcionesPublico = OPCIONES_PUBLICO,
  claseInicial,
  sucursalInicial,
  turnosPorSucursalYClase,
  detallesTurnosPorSucursalYClase,
  onVolver,
  onAgregarClase,
  onAjustarCupos,
  onGuardarEdicionComision,
}) {

  // --- ESTADOS DEL MODAL DINÁMICO ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombreNuevaClase, setNombreNuevaClase] = useState('');
  const [publicoNuevaClase, setPublicoNuevaClase] = useState('adultos');
  const [sucursalNuevaClase, setSucursalNuevaClase] = useState(sucursales[0]?.id || '');
  const [profesorNuevaClase, setProfesorNuevaClase] = useState('');
  const [busquedaClase, setBusquedaClase] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState(sucursalInicial || 'todas');
  const [filtroClase, setFiltroClase] = useState(claseInicial || 'todas');
  const [filtroPublico, setFiltroPublico] = useState('todos');
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [comisionEditando, setComisionEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);
  const [alumnoSeleccionadoTexto, setAlumnoSeleccionadoTexto] = useState('');
  const [mostrarDropdownAlumnos, setMostrarDropdownAlumnos] = useState(false);
  const diasHeaders = DIAS_SEMANA;

  useEffect(() => {
    const habiaOverflow = document.body.style.overflow;

    if (mostrarModal || mostrarModalEdicion) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = habiaOverflow;
    };
  }, [mostrarModal, mostrarModalEdicion]);
  
  // Cada fila es un objeto con la hora y los cupos por día
  const [filasConfig, setFilasConfig] = useState([
    { horaInicio: '09:00', horaFin: '11:00', cupos: { LU: '', MA: '', MI: '', JU: '', VI: '', SA: '' } }
  ]);

  const agregarFila = () => {
    setFilasConfig([...filasConfig, { horaInicio: '09:00', horaFin: '11:00', cupos: { LU: '', MA: '', MI: '', JU: '', VI: '', SA: '' } }]);
  };

  const actualizarHora = (index, campo, valor) => {
    const nuevasFilas = [...filasConfig];
    nuevasFilas[index][campo] = valor;
    setFilasConfig(nuevasFilas);
  };

  const actualizarCupo = (filaIndex, dia, valor) => {
    const nuevasFilas = [...filasConfig];
    nuevasFilas[filaIndex].cupos[dia] = valor;
    setFilasConfig(nuevasFilas);
  };

  const guardarNuevaClase = () => {
    if (!nombreNuevaClase.trim()) {
      alert("Ponele un nombre a la clase");
      return;
    }

    if (!sucursales.length) {
      alert("Primero agregá al menos una sucursal");
      return;
    }

    if (!profesorNuevaClase.trim()) {
      alert("Agregá el profesor de la comisión");
      return;
    }

    const guardadoOk = onAgregarClase(nombreNuevaClase, publicoNuevaClase, sucursalNuevaClase, profesorNuevaClase, filasConfig.map((fila) => ({ ...fila, hora: fila.horaInicio })));

    if (!guardadoOk) {
      alert("No se pudo guardar la clase");
      return;
    }

    setMostrarModal(false);
    setNombreNuevaClase('');
    setPublicoNuevaClase('adultos');
    setSucursalNuevaClase(sucursales[0]?.id || '');
    setProfesorNuevaClase('');
    setFilasConfig([{ horaInicio: '09:00', horaFin: '11:00', cupos: { LU: '', MA: '', MI: '', JU: '', VI: '', SA: '' } }]);
  };

  const abrirModalEdicion = (comision) => {
    const [dia, hora] = comision.turnoId.split('-')

    setComisionEditando(comision)
    setFormEdicion({
      sucursalId: comision.sucursalId,
      dia,
      hora,
      profesor: comision.profesor === 'Sin asignar' ? '' : comision.profesor,
      nombreClase: comision.claseNombre,
      publico: comision.publico,
      alumnos: comision.alumnos,
    })
    setAlumnoSeleccionadoTexto('')
    setMostrarDropdownAlumnos(false)
    setMostrarModalEdicion(true)
  }

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false)
    setComisionEditando(null)
    setFormEdicion(null)
    setAlumnoSeleccionadoTexto('')
    setMostrarDropdownAlumnos(false)
  }

  const actualizarCampoEdicion = (campo, valor) => {
    setFormEdicion((actual) => ({ ...actual, [campo]: valor }))
  }

  const desagendarAlumno = (alumnoId) => {
    setFormEdicion((actual) => ({
      ...actual,
      alumnos: actual.alumnos.filter((alumno) => alumno.id !== alumnoId),
    }))
  }

  const agregarAlumno = () => {
    if (!alumnoSeleccionadoTexto.trim()) {
      return
    }

    const alumnoExistente = alumnosDisponibles.find((alumno) => `${alumno.nombre} · ${alumno.tel}` === alumnoSeleccionadoTexto)

    if (!alumnoExistente) {
      return
    }

    setFormEdicion((actual) => ({
      ...actual,
      alumnos: [
        ...actual.alumnos,
        {
          id: alumnoExistente.id,
          nombre: alumnoExistente.nombre,
          telefono: alumnoExistente.tel,
        },
      ],
    }))
    setAlumnoSeleccionadoTexto('')
    setMostrarDropdownAlumnos(false)
  }

  const guardarEdicionComision = () => {
    if (!formEdicion || !comisionEditando) {
      return
    }

    if (!esHoraValida(formEdicion.hora)) {
      alert('Ingresá la hora en formato 00:00')
      return
    }

    const guardadoOk = onGuardarEdicionComision({
      originalSucursalId: comisionEditando.sucursalId,
      originalClaseId: comisionEditando.claseId,
      originalTurnoId: comisionEditando.turnoId,
      sucursalId: formEdicion.sucursalId,
      dia: formEdicion.dia,
      hora: formEdicion.hora,
      profesor: formEdicion.profesor,
      alumnos: formEdicion.alumnos,
      originalAlumnoIds: comisionEditando.alumnos.map((alumno) => alumno.id),
      nombreClase: formEdicion.nombreClase,
      publico: formEdicion.publico,
    })

    if (!guardadoOk) {
      alert('No se pudo guardar la comisión. Revisá si ese horario ya existe.')
      return
    }

    cerrarModalEdicion()
  }

  const comisiones = sucursales.flatMap((sucursal) => {
    const clasesSucursal = turnosPorSucursalYClase[sucursal.id] || {};

    return clases.flatMap((clase) => {
      const turnosClase = clasesSucursal[clase.id] || {};

      return Object.entries(turnosClase).map(([turnoId, cupos]) => {
        const detalle = obtenerDetalleTurno(detallesTurnosPorSucursalYClase, sucursal.id, clase.id, turnoId);

        return {
          id: `${sucursal.id}-${clase.id}-${turnoId}`,
          sucursalId: sucursal.id,
          sucursalNombre: sucursal.nombre,
          sucursalDireccion: sucursal.direccion,
          claseId: clase.id,
          claseNombre: clase.nombre,
          publico: clase.publico,
          turnoId,
          cupos,
          profesor: detalle.profesor,
          alumnos: detalle.alumnos,
        };
      });
    });
  });

  const comisionesFiltradas = comisiones
    .filter((comision) => comision.claseNombre.toLowerCase().includes(busquedaClase.toLowerCase()))
    .filter((comision) => filtroSucursal === 'todas' || comision.sucursalId === filtroSucursal)
    .filter((comision) => filtroClase === 'todas' || comision.claseId === filtroClase)
    .filter((comision) => filtroPublico === 'todos' || comision.publico === filtroPublico)
    .sort((a, b) => a.sucursalNombre.localeCompare(b.sucursalNombre) || a.claseNombre.localeCompare(b.claseNombre) || a.turnoId.localeCompare(b.turnoId));

  const alumnosDisponibles = formEdicion
    ? alumnos
      .filter((alumno) => !formEdicion.alumnos.some((alumnoAsignado) => alumnoAsignado.id === alumno.id))
    : []

  const alumnosFiltradosParaAsignar = useMemo(
    () => alumnosDisponibles.filter((alumno) => alumno.nombre.toLowerCase().includes(alumnoSeleccionadoTexto.toLowerCase())),
    [alumnoSeleccionadoTexto, alumnosDisponibles]
  );

  const styles = {
    container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: '0 auto', backgroundColor: 'var(--color-crema)', position: 'relative' },
    header: { backgroundColor: 'var(--color-marron-oscuro)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { color: '#E0C9A6', fontFamily: 'var(--font-titulo)', fontSize: '24px', margin: 0 },
    backButton: { width: '24px', height: '24px', padding: 0, border: 'none', backgroundColor: 'transparent', color: '#E0C9A6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logo: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'cover' },
    body: { padding: '20px', flex: 1 },
    contenedorFiltros: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' },
    inputBusqueda: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', fontSize: '16px', fontFamily: 'var(--font-principal)' },
    selectBase: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', fontFamily: 'var(--font-principal)' },
    tarjetaClase: { backgroundColor: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '15px' },
    filaSuperior: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
    etiquetaTurno: { backgroundColor: '#f0e1cd', color: 'var(--color-marron-oscuro)', padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' },
    nombreSucursal: { margin: '6px 0 0 0', fontSize: '13px', color: 'var(--color-marron-oscuro)', fontWeight: '700' },
    textoInfo: { margin: '6px 0 0 0', fontSize: '13px', color: '#555' },
    filaResumen: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' },
    chip: { backgroundColor: '#f7f1e8', color: '#5b4b41', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', boxShadow: '0 8px 16px rgba(201, 171, 132, 0.18)' },
    chipCupos: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f7f1e8', color: '#5b4b41', borderRadius: '999px', padding: '4px 6px 4px 10px', fontSize: '12px', fontWeight: '600', boxShadow: '0 8px 16px rgba(201, 171, 132, 0.18)' },
    chipCuposNumero: { minWidth: '18px', textAlign: 'center', fontWeight: '800', color: 'var(--color-marron-oscuro)' },
    chipIconButton: { width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: '#e7d6c1', color: 'var(--color-marron-oscuro)', cursor: 'pointer', padding: 0 },
    alumnosLista: { margin: '12px 0 0 0', paddingLeft: '18px', color: '#444', fontSize: '13px' },
    filaAcciones: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' },
    botonLapiz: { width: '44px', height: '44px', padding: 0, borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 18px rgba(93, 77, 66, 0.24)' },
    estadoVacio: { textAlign: 'center', color: '#777', padding: '22px 10px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.08)', marginBottom: '18px' },
    
    // ESTILOS MODAL DINÁMICO
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', display: mostrarModal ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1100 },
    overlayEdicion: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: mostrarModalEdicion ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1200 },
    modal: { backgroundColor: 'white', padding: '24px', borderRadius: '20px', width: '95%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 22px 40px rgba(0,0,0,0.16)', fontFamily: 'var(--font-principal)' },
    inputNombre: { width: '100%', padding: '12px 15px', marginBottom: '18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', fontFamily: 'var(--font-principal)', color: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
    inputBase: { width: '100%', padding: '12px 15px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', fontFamily: 'var(--font-principal)', color: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
    subtituloModal: { fontSize: '14px', fontFamily: 'var(--font-principal)', color: '#666', marginTop: 0, marginBottom: '14px', lineHeight: '1.4' },
    tituloModal: { color: 'var(--color-marron-oscuro)', fontFamily: 'var(--font-principal)', marginTop: 0, marginBottom: '8px', fontSize: '20px', fontWeight: '700' },
    ayudaModal: { fontSize: '14px', fontFamily: 'var(--font-principal)', color: '#666', marginTop: 0, marginBottom: '18px', lineHeight: '1.4' },
    etiquetaCampoModal: { display: 'block', marginBottom: '6px', color: '#5b4b41', fontSize: '13px', fontFamily: 'var(--font-principal)', fontWeight: '700', letterSpacing: '0.02em' },
    accionesModal: { display: 'flex', gap: '10px', marginTop: '8px' },
    botonModalSecundario: { flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#e9dcc9', color: 'var(--color-marron-oscuro)', fontSize: '18px', fontFamily: 'var(--font-principal)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.16)' },
    botonModalPrincipal: { flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', fontSize: '18px', fontFamily: 'var(--font-principal)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
    bloqueAlumnos: { marginTop: '10px', marginBottom: '14px' },
    alumnoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', border: '1px solid #eee', borderRadius: '8px', padding: '10px', marginBottom: '8px' },
    alumnoNombre: { fontFamily: 'var(--font-principal)', fontSize: '15px', fontWeight: '700', color: '#2f261e' },
    alumnoTelefono: { fontSize: '12px', fontFamily: 'var(--font-principal)', color: '#666' },
    botonDesagendar: { border: 'none', backgroundColor: '#fff4f4', color: '#b42318', borderRadius: '8px', padding: '12px 14px', fontSize: '15px', fontFamily: 'var(--font-principal)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(179, 35, 24, 0.12)' },
    filaAlumnoNuevo: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
    botonAgregarAlumno: { padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#95B89F', color: 'white', fontSize: '18px', fontFamily: 'var(--font-principal)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(96, 141, 109, 0.28)' },
    dropdownWrapper: { position: 'relative' },
    dropdownResultados: { position: 'absolute', top: 'calc(100% - 6px)', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 10px 24px rgba(0,0,0,0.12)', maxHeight: '180px', overflowY: 'auto', zIndex: 10 },
    dropdownItem: { width: '100%', textAlign: 'left', border: 'none', backgroundColor: 'white', padding: '10px 12px', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-principal)', color: '#333' },
    
    tablaMiniMarco: { width: '100%', marginBottom: '12px', overflowX: 'hidden' },
    tablaMini: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', textAlign: 'center', fontSize: '11px', marginBottom: 0, overflow: 'hidden', borderRadius: '12px' },
    th: { height: '38px', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', padding: 0, border: 'none', fontWeight: 'bold', fontFamily: 'var(--font-principal)', fontSize: '11px' },
    thHora: { width: '88px' },
    td: { height: '46px', border: 'none', padding: '4px', backgroundColor: '#FFFFFF' },
    tdCupoActiva: { backgroundColor: '#EAEAEA' },
    tdHora: { height: '46px', border: 'none', padding: '4px 5px', backgroundColor: '#C8A97E' },
    rangoHorarioEditable: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '100%' },
    separadorHorario: { color: 'var(--color-marron-oscuro)', fontWeight: '800', fontSize: '10px', fontFamily: 'var(--font-principal)' },
    inputHora: { width: '34px', border: 'none', textAlign: 'center', fontSize: '10px', fontFamily: 'var(--font-principal)', fontWeight: '800', borderRadius: '5px', padding: '7px 1px', boxSizing: 'border-box', backgroundColor: 'white', color: 'var(--color-marron-oscuro)' },
    inputCupo: { width: '100%', height: '100%', border: 'none', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '6px', padding: '6px 2px', boxSizing: 'border-box', color: '#7A7A7A', fontFamily: 'var(--font-principal)', fontWeight: '800', fontSize: '15px' },
    btnMas: { backgroundColor: '#95B89F', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '20px', marginBottom: '20px' },
    botonFlotante: { position: 'fixed', right: '24px', bottom: '24px', width: '64px', height: '64px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', fontSize: '34px', lineHeight: '1', cursor: 'pointer', boxShadow: '0 18px 34px rgba(0,0,0,0.22)', zIndex: 20 },
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Clases y comisiones</h2>

        <section className="filter-grid filter-grid--2 filter-grid--4" style={styles.contenedorFiltros}>
          <input
            style={styles.inputBusqueda}
            placeholder="Buscar por nombre de clase..."
            value={busquedaClase}
            onChange={(e) => setBusquedaClase(e.target.value)}
          />

          <select style={styles.selectBase} value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)}>
            <option value="todas">Todas las sucursales</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
            ))}
          </select>

          <select style={styles.selectBase} value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
            <option value="todas">Todos los talleres</option>
            {clases.map((clase) => (
              <option key={clase.id} value={clase.id}>{clase.nombre}</option>
            ))}
          </select>

          <select style={styles.selectBase} value={filtroPublico} onChange={(e) => setFiltroPublico(e.target.value)}>
            <option value="todos">Adultos y niños</option>
            {opcionesPublico.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
            ))}
          </select>
        </section>

        {comisionesFiltradas.length === 0 && (
          <div style={styles.estadoVacio}>
            No hay comisiones cargadas para ese filtro.
          </div>
        )}

        <div className="cards-grid cards-grid--2">
          {comisionesFiltradas.map((comision) => (
            <div key={comision.id} style={styles.tarjetaClase}>
              <div style={styles.filaSuperior}>
                <div>
                  <h3 style={{ color: 'var(--color-marron-oscuro)', margin: 0 }}>{comision.claseNombre}</h3>
                  <p style={styles.nombreSucursal}>{comision.sucursalNombre}</p>
                  <p style={styles.textoInfo}>{comision.sucursalDireccion}</p>
                </div>
                <span style={styles.etiquetaTurno}>{formatTurnoId(comision.turnoId)}</span>
              </div>

              <div style={styles.filaResumen}>
                <span style={styles.chip}>Profesor: {comision.profesor}</span>
                <span style={styles.chipCupos}>
                  Cupos
                  <span style={styles.chipCuposNumero}>{comision.cupos}</span>
                  <button type="button" style={styles.chipIconButton} onClick={() => onAjustarCupos(comision.sucursalId, comision.claseId, comision.turnoId, -1)} aria-label="Restar cupo">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button type="button" style={styles.chipIconButton} onClick={() => onAjustarCupos(comision.sucursalId, comision.claseId, comision.turnoId, 1)} aria-label="Sumar cupo">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
                <span style={styles.chip}>Alumnos: {comision.alumnos.length}</span>
                <span style={styles.chip}>Grupo: {opcionesPublico.find((opcion) => opcion.id === comision.publico)?.label || comision.publico}</span>
              </div>

              <ul style={styles.alumnosLista}>
                {comision.alumnos.length > 0 ? comision.alumnos.map((alumno) => (
                  <li key={alumno.id}>{alumno.nombre}</li>
                )) : <li>Sin alumnos registrados</li>}
              </ul>

              <div style={styles.filaAcciones}>
                <button type="button" style={styles.botonLapiz} onClick={() => abrirModalEdicion(comision)}>
                  ✎
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <button type="button" style={styles.botonFlotante} onClick={() => setMostrarModal(true)}>+</button>

      {/* MODAL CON GRILLA DINÁMICA */}
      <div style={styles.overlay} onClick={() => setMostrarModal(false)}>
        <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
          <h3 style={styles.tituloModal}>Configurar Grilla</h3>
          <p style={styles.ayudaModal}>
            Definí taller, sucursal, profesor y una grilla con horario de inicio, fin y cupos por día.
          </p>
          
          <input 
            style={styles.inputNombre} 
            placeholder="Nombre de la clase..." 
            value={nombreNuevaClase}
            onChange={(e) => setNombreNuevaClase(e.target.value)}
          />

          <select style={styles.inputBase} value={publicoNuevaClase} onChange={(e) => setPublicoNuevaClase(e.target.value)}>
            {opcionesPublico.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
            ))}
          </select>

          <select style={styles.inputBase} value={sucursalNuevaClase} onChange={(e) => setSucursalNuevaClase(e.target.value)}>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
            ))}
          </select>

          <input
            style={styles.inputBase}
            placeholder="Profesor a cargo..."
            value={profesorNuevaClase}
            onChange={(e) => setProfesorNuevaClase(e.target.value)}
          />

          <div style={styles.tablaMiniMarco}>
            <table style={styles.tablaMini}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, ...styles.thHora }}></th>
                  {diasHeaders.map(d => <th key={d} style={styles.th}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {filasConfig.map((fila, index) => (
                  <tr key={index}>
                    <td style={styles.tdHora}>
                      <div style={styles.rangoHorarioEditable}>
                        <input 
                          type="text" 
                          style={styles.inputHora} 
                          value={fila.horaInicio} 
                          onChange={(e) => actualizarHora(index, 'horaInicio', e.target.value)}
                        />
                        <span style={styles.separadorHorario}>–</span>
                        <input 
                          type="text" 
                          style={styles.inputHora} 
                          value={fila.horaFin} 
                          onChange={(e) => actualizarHora(index, 'horaFin', e.target.value)}
                        />
                      </div>
                    </td>
                    {diasHeaders.map(dia => (
                      <td key={dia} style={{ ...styles.td, ...(fila.cupos[dia] !== '' ? styles.tdCupoActiva : null) }}>
                        <input 
                          type="text" 
                          placeholder="-"
                          style={styles.inputCupo}
                          value={fila.cupos[dia]}
                          onChange={(e) => actualizarCupo(index, dia, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button style={styles.btnMas} onClick={agregarFila}>+</button>
          <p style={{ fontSize: '11px', color: '#666', marginBottom: '20px' }}>
            Poné el número de cupos en los días que quieras habilitar.
          </p>

          <div style={styles.accionesModal}>
            <button onClick={() => setMostrarModal(false)} style={styles.botonModalSecundario}>Cancelar</button>
            <button onClick={guardarNuevaClase} style={styles.botonModalPrincipal}>Guardar Clase</button>
          </div>
        </div>
      </div>

      <div style={styles.overlayEdicion} onClick={cerrarModalEdicion}>
        <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
          <h3 style={styles.tituloModal}>Editar clase</h3>
          <p style={styles.subtituloModal}>Podés desagendar alumnos, cambiar profesor y mover la comisión de día, hora o sucursal.</p>

          {formEdicion && (
            <>
              <label style={styles.etiquetaCampoModal}>Nombre del taller</label>
              <input style={styles.inputBase} value={formEdicion.nombreClase} onChange={(e) => actualizarCampoEdicion('nombreClase', e.target.value)} placeholder="Nombre del taller" />

              <label style={styles.etiquetaCampoModal}>Grupo</label>
              <select style={styles.inputBase} value={formEdicion.publico} onChange={(e) => actualizarCampoEdicion('publico', e.target.value)}>
                {opcionesPublico.map((opcion) => (
                  <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
                ))}
              </select>

              <label style={styles.etiquetaCampoModal}>Sucursal</label>
              <select style={styles.inputBase} value={formEdicion.sucursalId} onChange={(e) => actualizarCampoEdicion('sucursalId', e.target.value)}>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                ))}
              </select>

              <label style={styles.etiquetaCampoModal}>Dia</label>
              <select style={styles.inputBase} value={formEdicion.dia} onChange={(e) => actualizarCampoEdicion('dia', e.target.value)}>
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>

              <label style={styles.etiquetaCampoModal}>Hora</label>
              <input style={styles.inputBase} value={formEdicion.hora} onChange={(e) => actualizarCampoEdicion('hora', e.target.value)} placeholder="Hora 00:00" />
              <label style={styles.etiquetaCampoModal}>Profesor asignado</label>
              <input style={styles.inputBase} value={formEdicion.profesor} onChange={(e) => actualizarCampoEdicion('profesor', e.target.value)} placeholder="Profesor asignado" />

              <div style={styles.bloqueAlumnos}>
                <h4 style={{ marginBottom: '10px', color: 'var(--color-marron-oscuro)', fontFamily: 'var(--font-principal)', fontSize: '15px', fontWeight: '700' }}>Alumnos registrados</h4>
                {formEdicion.alumnos.length > 0 ? formEdicion.alumnos.map((alumno) => (
                  <div key={alumno.id} style={styles.alumnoItem}>
                    <div>
                      <div style={styles.alumnoNombre}>{alumno.nombre}</div>
                      <div style={styles.alumnoTelefono}>{alumno.telefono || 'Sin telefono'}</div>
                    </div>
                    <button type="button" style={styles.botonDesagendar} onClick={() => desagendarAlumno(alumno.id)}>
                      Desagendar
                    </button>
                  </div>
                )) : <p style={styles.subtituloModal}>No hay alumnos anotados.</p>}

                <div style={styles.filaAlumnoNuevo}>
                  <div style={styles.dropdownWrapper}>
                    <label style={styles.etiquetaCampoModal}>Agregar alumno</label>
                    <input
                      style={styles.inputBase}
                      value={alumnoSeleccionadoTexto}
                      onChange={(e) => {
                        setAlumnoSeleccionadoTexto(e.target.value)
                        setMostrarDropdownAlumnos(true)
                      }}
                      onFocus={() => setMostrarDropdownAlumnos(true)}
                      placeholder="Buscar o elegir alumno existente..."
                    />
                    {mostrarDropdownAlumnos && alumnosFiltradosParaAsignar.length > 0 && (
                      <div style={styles.dropdownResultados}>
                        {alumnosFiltradosParaAsignar.map((alumno) => (
                          <button
                            key={alumno.id}
                            type="button"
                            style={styles.dropdownItem}
                            onClick={() => {
                              setAlumnoSeleccionadoTexto(`${alumno.nombre} · ${alumno.tel}`)
                              setMostrarDropdownAlumnos(false)
                            }}
                          >
                            {alumno.nombre} · {alumno.tel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" style={styles.botonAgregarAlumno} onClick={agregarAlumno}>Asignar alumno</button>
                </div>
              </div>
            </>
          )}

          <div style={styles.accionesModal}>
            <button onClick={cerrarModalEdicion} style={styles.botonModalSecundario}>Cancelar</button>
            <button onClick={guardarEdicionComision} style={styles.botonModalPrincipal}>Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfesorClases;