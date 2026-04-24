// src/views/AlumnoAgendar.jsx
import React, { useEffect, useMemo, useState } from 'react';
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

        <section className={`agendar-bloque-paso ${pasoTallerVisible ? 'agendar-bloque-paso--visible' : 'agendar-bloque-paso--oculto'}`}>
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

        <section className={`agendar-bloque-paso ${pasoHorarioVisible ? 'agendar-bloque-paso--visible' : 'agendar-bloque-paso--oculto'}`}>
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
              onCellClick={(idTurno, hayClase) => {
                if (hayClase) setSlotSeleccionado(idTurno);
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

        {botonAgendarVisible && <BotonPrincipal text="Agendar" onClick={handleAgendar} />}
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