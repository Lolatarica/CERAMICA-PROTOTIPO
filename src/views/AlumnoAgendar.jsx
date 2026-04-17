// src/views/AlumnoAgendar.jsx
import React, { useEffect, useMemo, useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';
import BotonPrincipal from '../components/BotonPrincipal';
import CalendarioCupos from '../components/CalendarioCupos';
import { DIAS_SEMANA, HORAS_BASE } from '../utils/agendaConfig';

function AlumnoAgendar({ clases = [], sucursales = [], turnosPorSucursalYClase = {}, onConfirmar }) {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [slotSeleccionado, setSlotSeleccionado] = useState('');
  const [mostrarInfoClase, setMostrarInfoClase] = useState(false);

  useEffect(() => {
    if (sucursalSeleccionada && !sucursales.some((sucursal) => sucursal.id === sucursalSeleccionada)) {
      setSucursalSeleccionada('');
    }
  }, [sucursalSeleccionada, sucursales]);

  useEffect(() => {
    if (claseSeleccionada && !clases.some((clase) => clase.id === claseSeleccionada)) {
      setClaseSeleccionada('');
    }
  }, [claseSeleccionada, clases]);

  useEffect(() => {
    setSlotSeleccionado('');
  }, [sucursalSeleccionada, claseSeleccionada]);

  useEffect(() => {
    setMostrarInfoClase(false);
  }, [claseSeleccionada]);

  const sucursalActual = useMemo(
    () => sucursales.find((sucursal) => sucursal.id === sucursalSeleccionada) || null,
    [sucursales, sucursalSeleccionada]
  );

  const claseActual = useMemo(
    () => clases.find((clase) => clase.id === claseSeleccionada) || null,
    [clases, claseSeleccionada]
  );

  const turnosActuales = turnosPorSucursalYClase[sucursalSeleccionada]?.[claseSeleccionada] || {};
  const otraSucursal = sucursales.find((sucursal) => sucursal.id !== sucursalSeleccionada) || null;

  const textosPrecio = {
    ceramica: 'El precio del taller es de $68000 por 4 clases por mes.',
    pintura: 'Consultanos el valor actualizado de este taller.',
  };

  const textosInfoClase = {
    ceramica: {
      titulo: 'Taller de Ceramica',
      descripcion: 'Incluye una clase semanal. El valor mensual corresponde a 4 clases por mes y los materiales especiales se coordinan aparte si hiciera falta.',
    },
    pintura: {
      titulo: 'Taller de Pintura',
      descripcion: 'El valor puede variar segun grupo y materiales. Si queres este taller, escribinos por WhatsApp y te pasamos el detalle actualizado.',
    },
  };

  const pasoTallerVisible = Boolean(sucursalSeleccionada);
  const pasoHorarioVisible = Boolean(sucursalSeleccionada && claseSeleccionada);
  const botonAgendarVisible = Boolean(slotSeleccionado);
  const infoClaseActual = textosInfoClase[claseSeleccionada] || null;

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: '0 auto',
      position: 'relative',
      backgroundColor: 'var(--color-crema)'
    },
    header: {
      backgroundColor: 'var(--color-marron-oscuro)',
      padding: '40px 20px 20px 20px',
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    },
    logo: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '5px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      objectFit: 'cover'
    },
    title: {
      color: '#E0C9A6',
      fontFamily: 'var(--font-titulo)', // <-- Nueva línea usando nuestra variable
      fontSize: '28px',
      margin: '2px 0 0 0',
    },
    body: {
      padding: '34px 14px 28px',
      flex: 1,
    },
    bloquePaso: {
      marginBottom: '18px',
    },
    bloquePasoOculto: {
      opacity: 0,
      maxHeight: 0,
      overflow: 'hidden',
      marginBottom: 0,
      pointerEvents: 'none',
      transform: 'translateY(-8px)',
    },
    bloquePasoVisible: {
      opacity: 1,
      maxHeight: '1200px',
      overflow: 'visible',
      pointerEvents: 'auto',
      transform: 'translateY(0)',
      transition: 'opacity 0.24s ease, transform 0.24s ease, max-height 0.3s ease',
    },
    tituloPaso: {
      fontSize: '15px',
      fontWeight: '800',
      color: 'var(--color-marron-oscuro)',
      margin: '0 0 10px 0',
      lineHeight: '1.3'
    },
    labelCampo: {
      display: 'block',
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '10px',
      color: '#333',
      lineHeight: '1.25'
    },
    selectBase: {
      width: '100%',
      padding: '13px 14px',
      borderRadius: '10px',
      border: '1px solid #ddd',
      backgroundColor: 'var(--color-blanco)',
      fontSize: '15px',
      fontFamily: 'var(--font-principal)',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
      cursor: 'pointer'
    },
    filaPrecio: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      marginTop: '8px'
    },
    precioTexto: {
      flex: 1,
      fontSize: '13px',
      color: '#8b7b6f',
      lineHeight: '1.35',
      margin: 0
    },
    botonInfo: {
      border: 'none',
      backgroundColor: '#efe3d1',
      color: 'var(--color-marron-oscuro)',
      borderRadius: '999px',
      padding: '9px 14px',
      fontSize: '13px',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      boxShadow: '0 6px 12px rgba(200, 169, 126, 0.18)',
      cursor: 'pointer'
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(55, 42, 34, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px',
      zIndex: 80,
    },
    modalInfo: {
      width: '100%',
      maxWidth: '360px',
      backgroundColor: '#fffaf3',
      borderRadius: '18px',
      padding: '22px 18px 18px',
      boxShadow: '0 22px 38px rgba(0,0,0,0.18)',
    },
    modalTitulo: {
      margin: '0 0 10px 0',
      color: 'var(--color-marron-oscuro)',
      fontSize: '20px',
      lineHeight: '1.2',
    },
    modalSubtitulo: {
      margin: '0 0 8px 0',
      color: '#7a6b5f',
      fontSize: '13px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    modalTexto: {
      margin: '0 0 16px 0',
      color: '#5f544a',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    modalBoton: {
      width: '100%',
      border: 'none',
      backgroundColor: 'var(--color-marron-oscuro)',
      color: '#fff',
      borderRadius: '12px',
      padding: '13px 16px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
    },
    textoHorarios: {
      fontSize: '13px',
      color: '#8b7b6f',
      margin: '0 0 12px 0'
    },
    calendarioMarco: {
      width: '100%',
      borderRadius: '14px',
      overflow: 'hidden',
      backgroundColor: '#fffdf9',
      boxShadow: '0 10px 20px rgba(93, 77, 66, 0.08)',
    },
    botonSucursalAlternativa: {
      width: '100%',
      marginTop: '14px',
      border: 'none',
      backgroundColor: '#efe3d1',
      color: 'var(--color-marron-oscuro)',
      borderRadius: '14px',
      padding: '13px 16px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(200, 169, 126, 0.2)'
    },
    aclaracion: {
      fontSize: '12px',
      color: '#9a8a7d',
      textAlign: 'center',
      lineHeight: '1.35',
      margin: '16px 8px 0'
    },
    whatsapp: {
      position: 'fixed', 
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      cursor: 'pointer'
    }
  };

  const handleAgendar = () => {
    if (!sucursalSeleccionada || !claseSeleccionada) {
      alert('Primero elegi sucursal y taller.');
      return;
    }

    if (!slotSeleccionado) {
      alert('Por favor, selecciona un horario en el calendario.');
      return;
    }

    onConfirmar({
      turnoId: slotSeleccionado,
      sucursalId: sucursalSeleccionada,
      claseId: claseSeleccionada,
    });
  };

  return (
    <div className="app-shell" style={styles.container}>
      <header className="app-header" style={styles.header}>
        <img src={logoTaller} alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Agenda tu clase!</h1>
      </header>

      <main className="app-main" style={styles.body}>
        <section style={styles.bloquePaso}>
          <h2 style={styles.tituloPaso}>Paso 2: Seleccione la sucursal</h2>
          <label style={styles.labelCampo}>¿En qué sucursal querés cursar?*</label>
          <select
            style={styles.selectBase}
            value={sucursalSeleccionada}
            onChange={(event) => setSucursalSeleccionada(event.target.value)}
          >
            <option value="" disabled>Selecciona una sucursal...</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
            ))}
          </select>
        </section>

        <section style={{ ...styles.bloquePaso, ...(pasoTallerVisible ? styles.bloquePasoVisible : styles.bloquePasoOculto) }}>
          <h2 style={styles.tituloPaso}>Paso 3: Seleccione el taller al que desea asistir</h2>
          <label style={styles.labelCampo}>¿Qué taller querés cursar?*</label>
          <select
            style={styles.selectBase}
            value={claseSeleccionada}
            onChange={(event) => setClaseSeleccionada(event.target.value)}
          >
            <option value="" disabled>Selecciona un taller...</option>
            {clases.map((clase) => (
              <option key={clase.id} value={clase.id}>{clase.nombre}</option>
            ))}
          </select>

          <div style={styles.filaPrecio}>
            <p style={styles.precioTexto}>{textosPrecio[claseSeleccionada] || 'Consultanos el valor actualizado de este taller.'}</p>
            <button type="button" style={styles.botonInfo} onClick={() => setMostrarInfoClase(true)}>Mas info</button>
          </div>
        </section>

        <section style={{ ...styles.bloquePaso, ...(pasoHorarioVisible ? styles.bloquePasoVisible : styles.bloquePasoOculto) }}>
          <h2 style={styles.tituloPaso}>Paso 4: Seleccione un horario</h2>
          <p style={styles.textoHorarios}>
            {sucursalActual ? `Horarios disponibles para ${sucursalActual.nombre}.` : 'Seleccione una sucursal para ver los horarios.'}
          </p>

          <div style={styles.calendarioMarco}>
            <CalendarioCupos
              dias={DIAS_SEMANA}
              horas={HORAS_BASE}
              turnosActuales={turnosActuales}
              compacto
              modoEdicion={false}
              turnoViendoDetalle={slotSeleccionado}
              onCellClick={(idTurno, hayClase) => {
                if (hayClase) setSlotSeleccionado(idTurno);
              }}
            />
          </div>

          {otraSucursal && (
            <button
              type="button"
              style={styles.botonSucursalAlternativa}
              onClick={() => setSucursalSeleccionada(otraSucursal.id)}
            >
              {`Ver horarios de ${otraSucursal.nombre}`}
            </button>
          )}

          <p style={styles.aclaracion}>
            La cruz roja indica que los cupos estan completos en ese dia y horario.
          </p>
        </section>

        {botonAgendarVisible && <BotonPrincipal text="Agendar" onClick={handleAgendar} />}
      </main>

      {mostrarInfoClase && infoClaseActual && (
        <div style={styles.overlay} onClick={() => setMostrarInfoClase(false)}>
          <div style={styles.modalInfo} onClick={(event) => event.stopPropagation()}>
            <h3 style={styles.modalTitulo}>{infoClaseActual.titulo}</h3>
            <p style={styles.modalSubtitulo}>Aclaraciones</p>
            <p style={styles.modalTexto}>{infoClaseActual.descripcion}</p>
            <button type="button" style={styles.modalBoton} onClick={() => setMostrarInfoClase(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <img src={iconWhatsApp} alt="WhatsApp" style={styles.whatsapp} />
    </div>
  );
}

export default AlumnoAgendar;