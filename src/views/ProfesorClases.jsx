// src/views/ProfesorClases.jsx
import React, { useEffect, useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import { DIAS_SEMANA, esHoraValida, obtenerDetalleTurno, OPCIONES_PUBLICO } from '../utils/agendaConfig';
import { formatTurnoId } from '../utils/timeFormat';
import './ProfesorClases.css'; // <-- Acordate de crear este archivo

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

  return (
    <div className="app-shell app-shell--wide clases-container">
      <header className="app-header clases-header">
        <div className="clases-title-row">
          <button type="button" className="clases-back-button" onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="clases-title">Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" className="clases-logo" />
      </header>

      <main className="app-main content-shell content-shell--xl clases-body">
        <h2 className="clases-titulo-seccion">Clases y comisiones</h2>

        <section className="filter-grid filter-grid--2 filter-grid--4 clases-contenedor-filtros">
          <input
            className="clases-input-busqueda"
            placeholder="Buscar por nombre de clase..."
            value={busquedaClase}
            onChange={(e) => setBusquedaClase(e.target.value)}
          />

          <select className="clases-select-base" value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)}>
            <option value="todas">Todas las sucursales</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
            ))}
          </select>

          <select className="clases-select-base" value={filtroClase} onChange={(e) => setFiltroClase(e.target.value)}>
            <option value="todas">Todos los talleres</option>
            {clases.map((clase) => (
              <option key={clase.id} value={clase.id}>{clase.nombre}</option>
            ))}
          </select>

          <select className="clases-select-base" value={filtroPublico} onChange={(e) => setFiltroPublico(e.target.value)}>
            <option value="todos">Adultos y niños</option>
            {opcionesPublico.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
            ))}
          </select>
        </section>

        {comisionesFiltradas.length === 0 && (
          <div className="clases-estado-vacio">
            No hay comisiones cargadas para ese filtro.
          </div>
        )}

        <div className="cards-grid cards-grid--2">
          {comisionesFiltradas.map((comision) => (
            <div key={comision.id} className="clases-tarjeta-clase">
              <div className="clases-fila-superior">
                <div>
                  <h3 className="clases-nombre-clase">{comision.claseNombre}</h3>
                  <p className="clases-nombre-sucursal">{comision.sucursalNombre}</p>
                  <p className="clases-texto-info">{comision.sucursalDireccion}</p>
                </div>
                <span className="clases-etiqueta-turno">{formatTurnoId(comision.turnoId)}</span>
              </div>

              <div className="clases-fila-resumen">
                <span className="clases-chip">Profesor: {comision.profesor}</span>
                <span className="clases-chip-cupos">
                  Cupos
                  <span className="clases-chip-cupos-numero">{comision.cupos}</span>
                  <button type="button" className="clases-chip-icon-button" onClick={() => onAjustarCupos(comision.sucursalId, comision.claseId, comision.turnoId, -1)} aria-label="Restar cupo">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button type="button" className="clases-chip-icon-button" onClick={() => onAjustarCupos(comision.sucursalId, comision.claseId, comision.turnoId, 1)} aria-label="Sumar cupo">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
                <span className="clases-chip">Alumnos: {comision.alumnos.length}</span>
                <span className="clases-chip">Grupo: {opcionesPublico.find((opcion) => opcion.id === comision.publico)?.label || comision.publico}</span>
              </div>

              <ul className="clases-alumnos-lista">
                {comision.alumnos.length > 0 ? comision.alumnos.map((alumno) => (
                  <li key={alumno.id}>{alumno.nombre}</li>
                )) : <li>Sin alumnos registrados</li>}
              </ul>

              <div className="clases-fila-acciones">
                <button type="button" className="clases-boton-lapiz" onClick={() => abrirModalEdicion(comision)}>
                  ✎
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <button type="button" className="clases-boton-flotante" onClick={() => setMostrarModal(true)}>+</button>

      {/* MODAL CON GRILLA DINÁMICA */}
      <div className={`clases-overlay ${mostrarModal ? 'clases-overlay--visible' : ''}`} onClick={() => setMostrarModal(false)}>
        <div className="clases-modal" onClick={(event) => event.stopPropagation()}>
          <h3 className="clases-titulo-modal">Configurar Grilla</h3>
          <p className="clases-ayuda-modal">
            Definí taller, sucursal, profesor y una grilla con horario de inicio, fin y cupos por día.
          </p>
          <div className="clases-form-grid">
            <div className="clases-form-item">
              <label className="clases-etiqueta-campo-modal">Nombre del taller</label>
              <input 
                className="clases-input-nombre" 
                placeholder="Nombre de la clase..." 
                value={nombreNuevaClase}
                onChange={(e) => setNombreNuevaClase(e.target.value)}
              />
            </div>
            <div className="clases-form-item">
              <label className="clases-etiqueta-campo-modal">Grupo</label>
              <select className="clases-input-base" value={publicoNuevaClase} onChange={(e) => setPublicoNuevaClase(e.target.value)}>
                {opcionesPublico.map((opcion) => (
                  <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
                ))}
              </select>
            </div>
            <div className="clases-form-item">
              <label className="clases-etiqueta-campo-modal">Sucursal</label>
              <select className="clases-input-base" value={sucursalNuevaClase} onChange={(e) => setSucursalNuevaClase(e.target.value)}>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                ))}
              </select>
            </div>
            <div className="clases-form-item">
              <label className="clases-etiqueta-campo-modal">Profesor a cargo</label>
              <input
                className="clases-input-base"
                placeholder="Profesor a cargo..."
                value={profesorNuevaClase}
                onChange={(e) => setProfesorNuevaClase(e.target.value)}
              />
            </div>
            <div className="clases-form-item--full">
              <div className="clases-tabla-mini-marco">
                <table className="clases-tabla-mini">
                  <thead>
                    <tr>
                      <th className="clases-th clases-th-hora"></th>
                      {diasHeaders.map(d => <th key={d} className="clases-th">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filasConfig.map((fila, index) => (
                      <tr key={index}>
                        <td className="clases-td-hora">
                          <div className="clases-rango-horario-editable">
                            <input 
                              type="text" 
                              className="clases-input-hora" 
                              value={fila.horaInicio} 
                              onChange={(e) => actualizarHora(index, 'horaInicio', e.target.value)}
                            />
                            <span className="clases-separador-horario">–</span>
                            <input 
                              type="text" 
                              className="clases-input-hora" 
                              value={fila.horaFin} 
                              onChange={(e) => actualizarHora(index, 'horaFin', e.target.value)}
                            />
                          </div>
                        </td>
                        {diasHeaders.map(dia => (
                          <td key={dia} className={`clases-td ${fila.cupos[dia] !== '' ? 'clases-td-cupo-activa' : ''}`}>
                            <input 
                              type="text" 
                              placeholder="-"
                              className="clases-input-cupo"
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
              <button className="clases-btn-mas" onClick={agregarFila}>+</button>
              <p className="clases-texto-ayuda-mini">
                Poné el número de cupos en los días que quieras habilitar.
              </p>
            </div>
          </div>
          <div className="clases-acciones-modal">
            <button onClick={() => setMostrarModal(false)} className="clases-boton-modal-secundario">Cancelar</button>
            <button onClick={guardarNuevaClase} className="clases-boton-modal-principal">Guardar Clase</button>
          </div>
        </div>
      </div>

      <div className={`clases-overlay-edicion ${mostrarModalEdicion ? 'clases-overlay--visible' : ''}`} onClick={cerrarModalEdicion}>
        <div className="clases-modal" onClick={(event) => event.stopPropagation()}>
          <h3 className="clases-titulo-modal">Editar clase</h3>
          <p className="clases-subtitulo-modal">Podés desagendar alumnos, cambiar profesor y mover la comisión de día, hora o sucursal.</p>

          {formEdicion && (
            <div className="clases-form-grid">
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Nombre del taller</label>
                <input className="clases-input-base" value={formEdicion.nombreClase} onChange={(e) => actualizarCampoEdicion('nombreClase', e.target.value)} placeholder="Nombre del taller" />
              </div>
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Grupo</label>
                <select className="clases-input-base" value={formEdicion.publico} onChange={(e) => actualizarCampoEdicion('publico', e.target.value)}>
                  {opcionesPublico.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
                  ))}
                </select>
              </div>
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Sucursal</label>
                <select className="clases-input-base" value={formEdicion.sucursalId} onChange={(e) => actualizarCampoEdicion('sucursalId', e.target.value)}>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Dia</label>
                <select className="clases-input-base" value={formEdicion.dia} onChange={(e) => actualizarCampoEdicion('dia', e.target.value)}>
                  {DIAS_SEMANA.map((dia) => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Hora</label>
                <input className="clases-input-base" value={formEdicion.hora} onChange={(e) => actualizarCampoEdicion('hora', e.target.value)} placeholder="Hora 00:00" />
              </div>
              <div className="clases-form-item">
                <label className="clases-etiqueta-campo-modal">Profesor asignado</label>
                <input className="clases-input-base" value={formEdicion.profesor} onChange={(e) => actualizarCampoEdicion('profesor', e.target.value)} placeholder="Profesor asignado" />
              </div>
              <div className="clases-form-item--full">
                <div className="clases-bloque-alumnos">
                  <h4 className="clases-titulo-alumnos">Alumnos registrados</h4>
                  {formEdicion.alumnos.length > 0 ? formEdicion.alumnos.map((alumno) => (
                    <div key={alumno.id} className="clases-alumno-item">
                      <div>
                        <div className="clases-alumno-nombre">{alumno.nombre}</div>
                        <div className="clases-alumno-telefono">{alumno.telefono || 'Sin telefono'}</div>
                      </div>
                      <button type="button" className="clases-boton-desagendar" onClick={() => desagendarAlumno(alumno.id)}>
                        Desagendar
                      </button>
                    </div>
                  )) : <p className="clases-subtitulo-modal">No hay alumnos anotados.</p>}

                  <div className="clases-fila-alumno-nuevo">
                    <div className="clases-dropdown-wrapper">
                      <label className="clases-etiqueta-campo-modal">Agregar alumno</label>
                      <input
                        className="clases-input-base"
                        value={alumnoSeleccionadoTexto}
                        onChange={(e) => {
                          setAlumnoSeleccionadoTexto(e.target.value)
                          setMostrarDropdownAlumnos(true)
                        }}
                        onFocus={() => setMostrarDropdownAlumnos(true)}
                        placeholder="Buscar o elegir alumno existente..."
                      />
                      {mostrarDropdownAlumnos && alumnosFiltradosParaAsignar.length > 0 && (
                        <div className="clases-dropdown-resultados">
                          {alumnosFiltradosParaAsignar.map((alumno) => (
                            <button
                              key={alumno.id}
                              type="button"
                              className="clases-dropdown-item"
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
                    <button type="button" className="clases-boton-agregar-alumno" onClick={agregarAlumno}>Asignar alumno</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="clases-acciones-modal">
            <button onClick={cerrarModalEdicion} className="clases-boton-modal-secundario">Cancelar</button>
            <button onClick={guardarEdicionComision} className="clases-boton-modal-principal">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfesorClases;