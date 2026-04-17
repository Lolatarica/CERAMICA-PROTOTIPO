import React, { useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import CalendarioCupos from '../components/CalendarioCupos';
import { formatTurnoId } from '../utils/timeFormat';
import { DIAS_SEMANA, esHoraValida, HORAS_BASE, obtenerDetalleTurno, ordenarHoras } from '../utils/agendaConfig';

function ProfesorCupos({
  onVolver,
  claseInicial,
  sucursalInicial,
  clases = [],
  sucursales = [],
  turnosPorSucursalYClase = {},
  detallesTurnosPorSucursalYClase = {},
  onActualizarCupos,
  onEliminarHorario,
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

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: '0 auto',
      backgroundColor: 'var(--color-crema)',
      position: 'relative',
    },
    header: {
      backgroundColor: 'var(--color-marron-oscuro)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    },
    titleContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { color: '#E0C9A6', fontFamily: 'var(--font-titulo)', fontSize: '24px', margin: 0 },
    backButton: {
      width: '24px',
      height: '24px',
      padding: 0,
      border: 'none',
      backgroundColor: 'transparent',
      color: '#E0C9A6',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    logo: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'cover' },
    body: { padding: '20px', flex: 1 },
    contenedorSelect: { marginBottom: '20px' },
    labelSelect: { display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#333' },
    selectBase: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: 'var(--color-blanco)',
      fontSize: '16px',
      fontFamily: 'var(--font-principal)',
      cursor: 'pointer',
    },
    textoContexto: {
      fontSize: '12px',
      color: '#666',
      marginTop: '-8px',
      marginBottom: '18px',
    },
    envoltorioCalendario: {
      border: modoEdicion ? '3px dashed var(--color-marron-oscuro)' : '3px solid transparent',
      padding: modoEdicion ? '10px 8px 30px 8px' : '0',
      borderRadius: '14px',
      transition: 'all 0.3s ease',
      position: 'relative',
      backgroundColor: modoEdicion ? 'rgba(93, 77, 66, 0.05)' : 'transparent',
      marginBottom: '18px',
      overflow: 'visible',
    },
    cartelEdicion: {
      position: 'absolute',
      top: '-15px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--color-marron-oscuro)',
      color: 'white',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: modoEdicion ? 'block' : 'none',
    },
    botonAgregarFila: {
      position: 'absolute',
      left: '8px',
      bottom: '-30px',
      width: '78px',
      height: '46px',
      border: '3px dashed var(--color-marron-oscuro)',
      borderTop: 'none',
      borderRadius: '0 0 12px 12px',
      backgroundColor: '#C8A97E',
      color: 'var(--color-marron-oscuro)',
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '1',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      boxShadow: '0 8px 14px rgba(93, 77, 66, 0.12)',
    },
    tablaCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    tablaTituloContenedor: { backgroundColor: '#C8A97E', padding: '10px', textAlign: 'center' },
    tablaTitulo: { fontFamily: 'var(--font-principal)', fontSize: '16px', color: 'var(--color-marron-oscuro)', margin: 0, fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' },
    th: { backgroundColor: 'var(--color-marron-oscuro)', color: 'white', padding: '8px 5px', fontWeight: 'normal' },
    td: { padding: '10px 5px', color: '#333', borderBottom: '1px solid #eee' },
    botonesFlotantesContainer: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '30px' },
    botonRedondo: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'var(--color-marron-oscuro)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '30px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'transform 0.2s ease',
    },
    iconoBotonRedondo: {
      width: '26px',
      height: '26px',
      display: 'block',
    },
    botonRedondoActivo: { backgroundColor: '#C8A97E', transform: 'scale(1.1)' },
    overlayModal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '18px',
    },
    cajaModal: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '360px',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    inputModal: {
      width: '100%',
      padding: '10px',
      fontSize: '18px',
      textAlign: 'center',
      marginBottom: '14px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    filaCuposDias: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '10px',
      marginBottom: '18px',
    },
    cupoDiaItem: {
      textAlign: 'left',
    },
    cupoDiaLabel: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '700',
      color: '#5b4b41',
      marginBottom: '4px',
      textAlign: 'center',
    },
    inputCupoDia: {
      width: '100%',
      padding: '8px',
      fontSize: '15px',
      textAlign: 'center',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxSizing: 'border-box',
    },
    botonesModal: { display: 'flex', gap: '10px' },
    btnModal: { flex: 1, padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnEliminarModal: {
      flex: 1,
      padding: '10px',
      border: '1px solid #e3b3b3',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      backgroundColor: '#fff4f4',
      color: '#b42318',
    },
  };

  return (
    <div className="app-shell" style={styles.container}>
      <header className="app-header" style={styles.header}>
        <div style={styles.titleContainer}>
          <button type="button" style={styles.backButton} onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={styles.title}>Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" style={styles.logo} />
      </header>

      <main className="app-main content-shell content-shell--sm" style={styles.body}>
        <div className="filter-grid filter-grid--2">
          <div style={styles.contenedorSelect}>
            <label style={styles.labelSelect}>Sucursal:</label>
            <select
              style={styles.selectBase}
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

          <div style={styles.contenedorSelect}>
            <label style={styles.labelSelect}>Clase:</label>
            <select
              style={styles.selectBase}
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

        <p style={styles.textoContexto}>
          Editando cupos de {nombreClaseSeleccionada} en {nombreSucursalSeleccionada}.
        </p>

        <div style={styles.envoltorioCalendario}>
          <div style={styles.cartelEdicion}>MODO EDICION</div>

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
            <button type="button" style={styles.botonAgregarFila} onClick={abrirModalFila} aria-label="Agregar fila de horario">
              +
            </button>
          )}
        </div>

        {!modoEdicion && turnoViendoDetalle && (
          <div style={styles.tablaCard}>
            <div style={styles.tablaTituloContenedor}>
              <h2 style={styles.tablaTitulo}>Anotados para el {formatTurnoId(turnoViendoDetalle)}</h2>
            </div>
            <p style={{ margin: 0, padding: '12px 14px', borderBottom: '1px solid #eee', color: '#5b4b41', fontSize: '13px' }}>
              Profesor asignado: <strong>{detalleTurnoSeleccionado.profesor}</strong>
            </p>

            {detalleTurnoSeleccionado.alumnos.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Alumno</th>
                    <th style={styles.th}>Telefono</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleTurnoSeleccionado.alumnos.map((alumno) => (
                    <tr key={alumno.id}>
                      <td style={styles.td}>{alumno.nombre}</td>
                      <td style={styles.td}>{alumno.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', padding: '15px', color: '#666', margin: 0 }}>
                Aun no hay alumnos anotados en este turno.
              </p>
            )}
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '30px', marginTop: '10px' }}>
          <div style={styles.botonesFlotantesContainer}>
            <button
              type="button"
              style={{ ...styles.botonRedondo, ...(modoEdicion ? styles.botonRedondoActivo : {}) }}
              onClick={toggleEdicion}
              aria-label={modoEdicion ? 'Salir de edicion' : 'Entrar en edicion'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconoBotonRedondo}>
                <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" fill="currentColor" />
                <path d="M13.5 6 18 10.5" fill="none" stroke="var(--color-crema)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {modoEdicion && (
            <div style={{ position: 'absolute', right: '0', top: '70px', fontSize: '12px', color: '#666', textAlign: 'right', fontStyle: 'italic' }}>
              Toca el lapiz nuevamente<br />para salir y guardar.
            </div>
          )}
        </div>
      </main>

      {mostrarModalCupo && (
        <div style={styles.overlayModal}>
          <div style={styles.cajaModal}>
            <h3 style={{ marginTop: 0, color: 'var(--color-marron-oscuro)' }}>Turno: {celdaSeleccionada}</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px' }}>Ingresa la cantidad de cupos disponibles:</p>
            <input
              type="number"
              style={styles.inputModal}
              value={inputCupos}
              onChange={(event) => setInputCupos(event.target.value)}
              placeholder="Ej: 4"
              autoFocus
            />
            <div style={styles.botonesModal}>
              <button style={{ ...styles.btnModal, backgroundColor: '#ddd', color: '#333' }} onClick={cerrarModalCupo}>Cancelar</button>
              {turnosActuales[celdaSeleccionada] !== undefined && (
                <button style={styles.btnEliminarModal} onClick={eliminarHorario}>Eliminar</button>
              )}
              <button style={{ ...styles.btnModal, backgroundColor: 'var(--color-marron-oscuro)', color: 'white' }} onClick={guardarCupos}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalFila && (
        <div style={styles.overlayModal}>
          <div style={styles.cajaModal}>
            <h3 style={{ marginTop: 0, color: 'var(--color-marron-oscuro)' }}>Agregar horario</h3>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>Ingresa la hora y los cupos para cada dia que quieras habilitar.</p>
            <input
              type="text"
              style={styles.inputModal}
              value={nuevaHora}
              onChange={(event) => setNuevaHora(event.target.value)}
              placeholder="Hora 00:00"
              autoFocus
            />

            <div style={styles.filaCuposDias}>
              {dias.map((dia) => (
                <div key={dia} style={styles.cupoDiaItem}>
                  <label style={styles.cupoDiaLabel}>{dia}</label>
                  <input
                    type="text"
                    style={styles.inputCupoDia}
                    value={nuevosCupos[dia]}
                    onChange={(event) => actualizarCupoNuevo(dia, event.target.value)}
                    placeholder="-"
                  />
                </div>
              ))}
            </div>

            <div style={styles.botonesModal}>
              <button style={{ ...styles.btnModal, backgroundColor: '#ddd', color: '#333' }} onClick={cerrarModalFila}>Cancelar</button>
              <button style={{ ...styles.btnModal, backgroundColor: 'var(--color-marron-oscuro)', color: 'white' }} onClick={guardarNuevaFila}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfesorCupos;
