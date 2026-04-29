// src/views/ProfesorCupos.jsx
import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import CalendarioCupos from '../components/CalendarioCupos';
import AlumnoDetallePanel from '../components/AlumnoDetallePanel';
import { formatTurnoId } from '../utils/timeFormat';
import { DIAS_SEMANA, esHoraValida, HORAS_BASE, obtenerDetalleTurno, ordenarHoras } from '../utils/agendaConfig';
import './ProfesorCupos.css'; // <-- Asegurate de crear e importar este archivo

function ProfesorCupos({
  onVolver,
  claseInicial,
  sucursalInicial,
  clases = [],
  sucursales = [],
  turnosPorSucursalYClase = {},
  detallesTurnosPorSucursalYClase = {},
  alumnos = [],
  pagosAlumnos = {},
  mesesPago = [],
  onActualizarCupos,
  onEliminarHorario,
  onAgregarAsignacion,
  onGuardarAlumno,
  onDesasignarAlumno,
  onActualizarEstadoPago,
  onActualizarMetodoPago,
}) {
  const [claseSeleccionada, setClaseSeleccionada] = useState(claseInicial || clases[0]?.id || '');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(sucursalInicial || sucursales[0]?.id || '');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [turnoViendoDetalle, setTurnoViendoDetalle] = useState(null);
  const [mostrarModalCupo, setMostrarModalCupo] = useState(false);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState('');
  const [inputCupos, setInputCupos] = useState('');
  const [mostrarModalFila, setMostrarModalFila] = useState(false);
  const [nuevaHora, setNuevaHora] = useState(HORAS_BASE[0] || '09:00');
  const [alumnoDetalleId, setAlumnoDetalleId] = useState(null);
  const [nuevosCupos, setNuevosCupos] = useState(() =>
    DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: '' }), {})
  );

  const dias = DIAS_SEMANA;
  const turnosActuales = turnosPorSucursalYClase[sucursalSeleccionada]?.[claseSeleccionada] || {};
  const horas = useMemo(
    () => ordenarHoras(Array.from(new Set([
      ...HORAS_BASE,
      ...Object.keys(turnosActuales).map((turnoId) => turnoId.split('-')[1]),
    ]))),
    [turnosActuales]
  );

  const detalleTurnoSeleccionado = turnoViendoDetalle
    ? obtenerDetalleTurno(detallesTurnosPorSucursalYClase, sucursalSeleccionada, claseSeleccionada, turnoViendoDetalle)
    : { profesor: 'Sin asignar', alumnos: [] };

  const alumnoSeleccionado = useMemo(() => {
    if (!alumnoDetalleId) {
      return null;
    }

    const alumnoExistente = alumnos.find((alumno) => alumno.id === alumnoDetalleId);

    if (alumnoExistente) {
      return alumnoExistente;
    }

    const alumnoEnDetalle = (detalleTurnoSeleccionado.alumnos || []).find((alumno) => alumno.id === alumnoDetalleId);

    if (!alumnoEnDetalle || !turnoViendoDetalle) {
      return null;
    }

    return {
      id: alumnoEnDetalle.id,
      nombre: alumnoEnDetalle.nombre,
      tel: alumnoEnDetalle.telefono || '',
      mail: '',
      asignaciones: [{
        sucursalId: sucursalSeleccionada,
        claseId: claseSeleccionada,
        turnoId: turnoViendoDetalle,
      }],
      sucursalId: sucursalSeleccionada,
      claseId: claseSeleccionada,
      turnoId: turnoViendoDetalle,
    };
  }, [alumnoDetalleId, alumnos, detalleTurnoSeleccionado.alumnos, turnoViendoDetalle, sucursalSeleccionada, claseSeleccionada]);

  const nombreClaseSeleccionada = clases.find((clase) => clase.id === claseSeleccionada)?.nombre || 'clase';
  const nombreSucursalSeleccionada = sucursales.find((sucursal) => sucursal.id === sucursalSeleccionada)?.nombre || 'sucursal';

  const manejarClicCelda = (idTurno, hayClase) => {
    if (modoEdicion) {
      setCeldaSeleccionada(idTurno);
      setInputCupos(turnosActuales[idTurno] ?? '');
      setMostrarModalCupo(true);
      return;
    }

    if (!hayClase) {
      return;
    }

    setTurnoViendoDetalle((actual) => (actual === idTurno ? null : idTurno));
  };

  const toggleEdicion = () => {
    setModoEdicion((actual) => !actual);
    setTurnoViendoDetalle(null);
  };

  const cerrarModalCupo = () => {
    setMostrarModalCupo(false);
    setCeldaSeleccionada('');
    setInputCupos('');
  };

  const guardarCupos = () => {
    if (inputCupos === '' || Number(inputCupos) < 0) {
      alert('Ingresa un numero valido de cupos');
      return;
    }

    onActualizarCupos(sucursalSeleccionada, claseSeleccionada, celdaSeleccionada, parseInt(inputCupos, 10));
    cerrarModalCupo();
  };

  const eliminarHorario = () => {
    onEliminarHorario(sucursalSeleccionada, claseSeleccionada, celdaSeleccionada);
    cerrarModalCupo();
  };

  const guardarDatosAlumnoDesdeDetalle = (datosAlumno) => {
    if (!alumnoSeleccionado) {
      return {
        ok: false,
        mensaje: 'No se encontro el alumno seleccionado.',
      };
    }

    const nombre = datosAlumno?.nombre?.trim() || '';
    const tel = datosAlumno?.tel?.trim() || '';
    const mail = datosAlumno?.mail?.trim() || '';

    const errores = {
      nombre: !nombre ? 'Este casillero es obligatorio para continuar' : null,
      tel: !tel ? 'Este casillero es obligatorio para continuar' : null,
      mail: !mail
        ? 'Este casillero es obligatorio para continuar'
        : !mail.includes('@')
          ? 'El mail debe incluir una arroba (@)'
          : null,
    };

    if (Object.values(errores).some(Boolean)) {
      return {
        ok: false,
        errores,
      };
    }

    const guardadoOk = onGuardarAlumno?.({
      ...alumnoSeleccionado,
      nombre,
      tel,
      mail,
    });

    if (guardadoOk === false) {
      return {
        ok: false,
        mensaje: 'No se pudieron guardar los cambios del alumno.',
      };
    }

    return { ok: true };
  };

  const abrirModalFila = () => {
    setNuevaHora(HORAS_BASE[0] || '09:00');
    setNuevosCupos(DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: '' }), {}));
    setMostrarModalFila(true);
  };

  const cerrarModalFila = () => {
    setMostrarModalFila(false);
    setNuevaHora(HORAS_BASE[0] || '09:00');
    setNuevosCupos(DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: '' }), {}));
  };

  const actualizarCupoNuevo = (dia, valor) => {
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    setNuevosCupos((actual) => ({
      ...actual,
      [dia]: soloNumeros,
    }));
  };

  const guardarNuevaFila = () => {
    if (!esHoraValida(nuevaHora)) {
      alert('Ingresa la hora en formato 00:00');
      return;
    }

    const diasConCupo = dias.filter((dia) => nuevosCupos[dia] !== '');

    if (diasConCupo.length === 0) {
      alert('Ingresa al menos un cupo para algun dia');
      return;
    }

    const yaExiste = diasConCupo.some((dia) => turnosActuales[`${dia}-${nuevaHora}`] !== undefined);
    if (yaExiste) {
      alert('Alguno de esos horarios ya existe para esta clase y sucursal');
      return;
    }

    diasConCupo.forEach((dia) => {
      onActualizarCupos(
        sucursalSeleccionada,
        claseSeleccionada,
        `${dia}-${nuevaHora}`,
        parseInt(nuevosCupos[dia], 10)
      );
    });

    cerrarModalFila();
  };

  return (
    <div className="app-shell app-shell--wide cupos-container">
      <header className="app-header cupos-header">
        <div className="cupos-title-container">
          <button type="button" className="cupos-back-button" onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="cupos-title">Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" className="cupos-logo" />
      </header>

      <main className="app-main content-shell content-shell--xl cupos-body">
        <div className="filter-grid filter-grid--2">
          <div className="cupos-contenedor-select">
            <label className="cupos-label-select">Sucursal:</label>
            <select
              className="cupos-select-base"
              value={sucursalSeleccionada}
              onChange={(event) => {
                setSucursalSeleccionada(event.target.value);
                setTurnoViendoDetalle(null);
              }}
            >
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
              ))}
            </select>
          </div>

          <div className="cupos-contenedor-select">
            <label className="cupos-label-select">Clase:</label>
            <select
              className="cupos-select-base"
              value={claseSeleccionada}
              onChange={(event) => {
                setClaseSeleccionada(event.target.value);
                setTurnoViendoDetalle(null);
              }}
            >
              {clases.map((clase) => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="cupos-texto-contexto">
          Editando cupos de {nombreClaseSeleccionada} en {nombreSucursalSeleccionada}.
        </p>

        <div className={`cupos-envoltorio-calendario ${modoEdicion ? 'cupos-envoltorio-calendario--edicion' : ''}`}>
          <div className={`cupos-cartel-edicion ${modoEdicion ? 'cupos-cartel-edicion--visible' : ''}`}>
            MODO EDICION
          </div>

          <CalendarioCupos
            dias={dias}
            horas={horas}
            turnosActuales={turnosActuales}
            compacto
            modoEdicion={modoEdicion}
            turnoViendoDetalle={turnoViendoDetalle}
            onCellClick={manejarClicCelda}
          />

          {modoEdicion && (
            <button type="button" className="cupos-boton-agregar-fila" onClick={abrirModalFila} aria-label="Agregar fila de horario">
              +
            </button>
          )}
        </div>

        {!modoEdicion && turnoViendoDetalle && (
          <div className="cupos-tabla-card">
            <div className="cupos-tabla-titulo-contenedor">
              <h2 className="cupos-tabla-titulo">Anotados para el {formatTurnoId(turnoViendoDetalle)}</h2>
            </div>
            <p className="cupos-texto-profesor">
              Profesor asignado: <strong>{detalleTurnoSeleccionado.profesor}</strong>
            </p>

            {detalleTurnoSeleccionado.alumnos.length > 0 ? (
              <table className="cupos-table">
                <thead>
                  <tr>
                    <th className="cupos-th">Alumno</th>
                    <th className="cupos-th">Telefono</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleTurnoSeleccionado.alumnos.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="cupos-fila-alumno"
                      onClick={() => setAlumnoDetalleId(alumno.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setAlumnoDetalleId(alumno.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver detalle de ${alumno.nombre}`}
                    >
                      <td className="cupos-td">{alumno.nombre}</td>
                      <td className="cupos-td">{alumno.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="cupos-texto-vacio">
                Aun no hay alumnos anotados en este turno.
              </p>
            )}
          </div>
        )}

        <div className="cupos-botones-flotantes-wrap">
          <div className="cupos-botones-flotantes-container">
            <button
              type="button"
              className={`cupos-boton-redondo ${modoEdicion ? 'cupos-boton-redondo--activo' : ''}`}
              onClick={toggleEdicion}
              aria-label={modoEdicion ? 'Salir de edicion' : 'Entrar en edicion'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="cupos-icono-boton-redondo">
                <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" fill="currentColor" />
                <path d="M13.5 6 18 10.5" fill="none" stroke="var(--color-crema)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {modoEdicion && (
            <div className="cupos-texto-ayuda">
              Toca el lapiz nuevamente<br />para salir y guardar.
            </div>
          )}
        </div>
      </main>

      {mostrarModalCupo && (
        <div className="cupos-overlay-modal">
          <div className="cupos-caja-modal">
            <h3 className="cupos-modal-titulo">Turno: {celdaSeleccionada}</h3>
            <p className="cupos-modal-texto">Ingresa la cantidad de cupos disponibles:</p>
            <input
              type="number"
              className="cupos-input-modal"
              value={inputCupos}
              onChange={(event) => setInputCupos(event.target.value)}
              placeholder="Ej: 4"
              autoFocus
            />
            <div className="cupos-botones-modal">
              <button className="cupos-btn-modal cupos-btn-cancelar" onClick={cerrarModalCupo}>Cancelar</button>
              {turnosActuales[celdaSeleccionada] !== undefined && (
                <button className="cupos-btn-eliminar-modal" onClick={eliminarHorario}>Eliminar</button>
              )}
              <button className="cupos-btn-modal cupos-btn-aceptar" onClick={guardarCupos}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalFila && (
        <div className="cupos-overlay-modal">
          <div className="cupos-caja-modal">
            <h3 className="cupos-modal-titulo">Agregar horario</h3>
            <p className="cupos-modal-texto">Ingresa la hora y los cupos para cada dia que quieras habilitar.</p>
            <input
              type="text"
              className="cupos-input-modal"
              value={nuevaHora}
              onChange={(event) => setNuevaHora(event.target.value)}
              placeholder="Hora 00:00"
              autoFocus
            />

            <div className="cupos-fila-cupos-dias">
              {dias.map((dia) => (
                <div key={dia} className="cupos-cupo-dia-item">
                  <label className="cupos-cupo-dia-label">{dia}</label>
                  <input
                    type="text"
                    className="cupos-input-cupo-dia"
                    value={nuevosCupos[dia]}
                    onChange={(event) => actualizarCupoNuevo(dia, event.target.value)}
                    placeholder="-"
                  />
                </div>
              ))}
            </div>

            <div className="cupos-botones-modal">
              <button className="cupos-boton-modal-secundario" onClick={cerrarModalFila}>Cancelar</button>
              <button className="cupos-boton-modal-principal" onClick={guardarNuevaFila}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {alumnoSeleccionado && (
        <AlumnoDetallePanel
          alumno={alumnoSeleccionado}
          clases={clases}
          sucursales={sucursales}
          turnosPorSucursalYClase={turnosPorSucursalYClase}
          pagosAlumno={pagosAlumnos[alumnoSeleccionado.id]}
          mesesPago={mesesPago}
          claseInicialPagos={claseSeleccionada}
          onAgregarAsignacion={(nuevaAsignacion) => onAgregarAsignacion?.(alumnoSeleccionado.id, nuevaAsignacion)}
          onActualizarEstadoPago={onActualizarEstadoPago}
          onActualizarMetodoPago={onActualizarMetodoPago}
          onQuitarAsignacion={(asignacion) => onDesasignarAlumno?.(alumnoSeleccionado.id, asignacion)}
          onGuardarDatosAlumno={guardarDatosAlumnoDesdeDetalle}
          onClose={() => setAlumnoDetalleId(null)}
        />
      )}
    </div>
  );
}

export default ProfesorCupos;