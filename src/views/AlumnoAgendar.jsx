// src/views/AlumnoAgendar.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';
import BotonPrincipal from '../components/BotonPrincipal';
import CalendarioCupos from '../components/CalendarioCupos';
import { DIAS_SEMANA, HORAS_BASE } from '../utils/agendaConfig';
import './AlumnoAgendar.css'; // <-- Acordate de crear e importar este archivo

function AlumnoAgendar({ clases = [], sucursales = [], turnosPorSucursalYClase = {}, onConfirmar }) {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [slotSeleccionado, setSlotSeleccionado] = useState('');
  const [mostrarInfoClase, setMostrarInfoClase] = useState(false);
  const pasoTallerRef = useRef(null);
  const pasoHorarioRef = useRef(null);
  const botonAgendarRef = useRef(null);
  const animacionScrollRef = useRef(null);

  const cancelarAnimacionScroll = () => {
    if (animacionScrollRef.current !== null) {
      window.cancelAnimationFrame(animacionScrollRef.current);
      animacionScrollRef.current = null;
    }
  };

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const desplazarASiguientePaso = (elemento, block = 'start') => {
    if (!elemento || typeof window === 'undefined') {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elemento.scrollIntoView({ behavior: 'auto', block });
      return;
    }

    cancelarAnimacionScroll();

    const rect = elemento.getBoundingClientRect();
    const inicio = window.scrollY;
    const destinoBase = inicio + rect.top;
    const destino =
      block === 'center'
        ? Math.max(0, destinoBase - (window.innerHeight / 2) + (rect.height / 2))
        : Math.max(0, destinoBase - 12);
    const distancia = destino - inicio;

    if (Math.abs(distancia) < 3) {
      return;
    }

    const duracion = 1450;
    const inicioTiempo = performance.now();

    const animar = (tiempoActual) => {
      const progreso = Math.min((tiempoActual - inicioTiempo) / duracion, 1);
      const progresoSuave = easeInOutCubic(progreso);
      window.scrollTo(0, inicio + distancia * progresoSuave);

      if (progreso < 1) {
        animacionScrollRef.current = window.requestAnimationFrame(animar);
      } else {
        animacionScrollRef.current = null;
      }
    };

    animacionScrollRef.current = window.requestAnimationFrame(animar);
  };

  const programarScrollPaso = (elemento, block = 'start') => {
    if (!elemento || typeof window === 'undefined') {
      return () => {};
    }

    const timeoutPrincipal = window.setTimeout(() => {
      desplazarASiguientePaso(elemento, block);
    }, 460);

    // Segundo ajuste para pantallas medianas donde el alto del bloque termina de cambiar despues.
    const timeoutAjuste = window.setTimeout(() => {
      desplazarASiguientePaso(elemento, block);
    }, 980);

    return () => {
      window.clearTimeout(timeoutPrincipal);
      window.clearTimeout(timeoutAjuste);
    };
  };

  useEffect(() => () => cancelarAnimacionScroll(), []);

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

  useEffect(() => {
    if (!sucursalSeleccionada) {
      return;
    }

    return programarScrollPaso(pasoTallerRef.current, 'start');
  }, [sucursalSeleccionada]);

  useEffect(() => {
    if (!sucursalSeleccionada || !claseSeleccionada) {
      return;
    }

    return programarScrollPaso(pasoHorarioRef.current, 'start');
  }, [sucursalSeleccionada, claseSeleccionada]);

  useEffect(() => {
    if (!slotSeleccionado || typeof window === 'undefined') {
      return;
    }

    return programarScrollPaso(botonAgendarRef.current, 'center');
  }, [slotSeleccionado]);

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
      descripcion: '* Las clases son una vez por semana de 2 horas con proyectos libres: modelado, construcción y torno. Crea a tu ritmo, te acompañamos en cada paso y horneamos tus piezas para que te las lleves listas. 4 clases al mes (Si el mes tiene 5 semanas no se dicta clase en la 5ª semana) Valor mensual:$68000 (incluye materiales y horneada, no es necesario que traigas nada!) Pago del 1 al 10 de cada mes preferentemente en efectivo Para una comunicación más fluida podés enviarme un WhatsApp: +54 9 11 6597-2182. Tenemos dos sedes una en Villa Devoto , Fernández de Enciso 3929 1*A y otra en Villa Pueyrredon , Nazca 4480 entre José Cubas y Vallejos',
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
    <div className="app-shell agendar-container">
      <header className="app-header agendar-header">
        <img src={logoTaller} alt="Logo" className="agendar-logo" />
        <h1 className="agendar-title">Agenda tu clase!</h1>
      </header>

      <main className="app-main agendar-body">
        <section className="agendar-bloque-paso">
          <h2 className="agendar-titulo-paso">Paso 2: Seleccione la sucursal</h2>
          <label className="agendar-label-campo">¿En qué sucursal querés cursar?*</label>
          <select
            className="agendar-select-base"
            value={sucursalSeleccionada}
            onChange={(event) => setSucursalSeleccionada(event.target.value)}
          >
            <option value="" disabled>Selecciona una sucursal...</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
            ))}
          </select>
        </section>

        <section
          ref={pasoTallerRef}
          className={`agendar-bloque-paso ${pasoTallerVisible ? 'agendar-bloque-paso--visible' : 'agendar-bloque-paso--oculto'}`}
        >
          <h2 className="agendar-titulo-paso">Paso 3: Seleccione el taller al que desea asistir</h2>
          <label className="agendar-label-campo">¿Qué taller querés cursar?*</label>
          <select
            className="agendar-select-base"
            value={claseSeleccionada}
            onChange={(event) => setClaseSeleccionada(event.target.value)}
          >
            <option value="" disabled>Selecciona un taller...</option>
            {clases.map((clase) => (
              <option key={clase.id} value={clase.id}>{clase.nombre}</option>
            ))}
          </select>

          <div className="agendar-fila-precio">
            <p className="agendar-precio-texto">{textosPrecio[claseSeleccionada] || 'Consultanos el valor actualizado de este taller.'}</p>
            <button type="button" className="agendar-boton-info" onClick={() => setMostrarInfoClase(true)}>Mas info</button>
          </div>
        </section>

        <section
          ref={pasoHorarioRef}
          className={`agendar-bloque-paso ${pasoHorarioVisible ? 'agendar-bloque-paso--visible' : 'agendar-bloque-paso--oculto'}`}
        >
          <h2 className="agendar-titulo-paso">Paso 4: Seleccione un horario</h2>
          <p className="agendar-texto-horarios">
            {sucursalActual ? `Horarios disponibles para ${sucursalActual.nombre}.` : 'Seleccione una sucursal para ver los horarios.'}
          </p>

          <div className="agendar-calendario-marco">
            <CalendarioCupos
              dias={DIAS_SEMANA}
              horas={HORAS_BASE}
              turnosActuales={turnosActuales}
              compacto
              modoEdicion={false}
              turnoViendoDetalle={slotSeleccionado}
              onCellClick={(idTurno, hayClase, sinCupo) => {
                if (hayClase && !sinCupo) setSlotSeleccionado(idTurno);
              }}
            />
          </div>

          {otraSucursal && (
            <button
              type="button"
              className="agendar-boton-sucursal-alternativa"
              onClick={() => setSucursalSeleccionada(otraSucursal.id)}
            >
              {`Ver horarios de ${otraSucursal.nombre}`}
            </button>
          )}

          <p className="agendar-aclaracion">
            La cruz roja indica que los cupos estan completos en ese dia y horario.
          </p>
        </section>

        {botonAgendarVisible && (
          <div ref={botonAgendarRef} className="agendar-ancla-boton">
            <BotonPrincipal text="Agendar" onClick={handleAgendar} />
          </div>
        )}
      </main>

      {mostrarInfoClase && infoClaseActual && (
        <div className="agendar-overlay" onClick={() => setMostrarInfoClase(false)}>
          <div
            className="agendar-modal-info"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="agendar-modal-titulo">{infoClaseActual.titulo}</h3>
            <p className="agendar-modal-subtitulo">Aclaraciones</p>
            <ul className="agendar-modal-texto" style={{ listStyleType: 'disc', paddingLeft: 24 }}>
              {infoClaseActual.descripcion
                .split(/(?<=[.!?])\s+/)
                .filter(Boolean)
                .map((frase, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{frase}</li>
                ))}
            </ul>
            <button type="button" className="agendar-modal-boton" onClick={() => setMostrarInfoClase(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <img src={iconWhatsApp} alt="WhatsApp" className="agendar-whatsapp" />
    </div>
  );
}

export default AlumnoAgendar;