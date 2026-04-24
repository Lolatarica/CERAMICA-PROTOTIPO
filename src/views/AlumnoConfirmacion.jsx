// src/views/AlumnoConfirmacion.jsx
import React, { useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';
import { formatClassTimeRange } from '../utils/timeFormat';
import './AlumnoConfirmacion.css'; // <-- Acordate de crear e importar este archivo

function AlumnoConfirmacion({ nombre = "Nombre Apellido", turno = "Día - hora", profesora = "Sin asignar" }) {
  const [aliasCopiado, setAliasCopiado] = useState(false);
  const aliasPago = 'tu.alias';
  
  // Vamos a separar el string "LU-14:00" para que quede más lindo visualmente
  const [dia, hora] = turno ? turno.split('-') : ['Día', 'hora'];

  // Un pequeño diccionario para que "LU" diga "Lunes"
  const nombresDias = {
    'LU': 'Lunes', 'MA': 'Martes', 'MI': 'Miércoles', 
    'JU': 'Jueves', 'VI': 'Viernes', 'SA': 'Sábado'
  };
  const diaCompleto = nombresDias[dia] || dia;
  const horaRango = formatClassTimeRange(hora);

  const handleCopiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(aliasPago);
      setAliasCopiado(true);
      window.setTimeout(() => setAliasCopiado(false), 2000);
    } catch {
      setAliasCopiado(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/+541234567890', '_blank'); // Cambia el número por el de la profesora
  };

  return (
    <div className="app-shell confirmacion-container">
      <header className="app-header confirmacion-header">
        <img src={logoTaller} alt="Logo" className="confirmacion-logo" />
        <h1 className="confirmacion-title">Agenda tu clase!</h1>
      </header>

      <main className="app-main desktop-confirm-grid confirmacion-body">
        <section className="desktop-confirm-section desktop-confirm-section--summary confirmacion-section-summary">
          <div className="confirmacion-texto-principal">
            ¡{nombre}, tu clase está casi lista!
          </div>

          <div className="confirmacion-texto-secundario">
            Te falta el último paso para confirmar tu reserva.
          </div>

          <div className="confirmacion-resumen-card">
            <div className="confirmacion-resumen-fila">
              <div className="confirmacion-resumen-texto"><span className="confirmacion-resumen-label">Día:</span> {diaCompleto} del mes</div>
            </div>
            <div className="confirmacion-resumen-fila-separada">
              <div className="confirmacion-resumen-texto"><span className="confirmacion-resumen-label">Hora:</span> {horaRango}</div>
            </div>
            <div className="confirmacion-resumen-fila-separada">
              <div className="confirmacion-resumen-texto"><span className="confirmacion-resumen-label">Profesora:</span> {profesora}</div>
            </div>
          </div>
        </section>

        <section className="desktop-confirm-section desktop-confirm-section--payment confirmacion-section-payment">
          <p className="confirmacion-paso-texto"><span className="confirmacion-paso-destacado">Paso 5:</span><span className="confirmacion-paso-descripcion"> Reserva tu clase con un adelanto</span></p>
          <p className="confirmacion-texto-pago">Monto para reservar la clase: <strong>$5000</strong></p>

          <div className="confirmacion-alias-box">
            <p className="confirmacion-alias-texto">Alias CBU/CVU: <span className="confirmacion-alias-valor">{aliasPago}</span></p>
            <button type="button" className="confirmacion-boton-copiar" onClick={handleCopiarAlias}>
              {aliasCopiado ? 'COPIADO' : 'COPIAR ALIAS'}
            </button>
          </div>

          <p className="confirmacion-paso-texto"><span className="confirmacion-paso-destacado">Paso 6:</span><span className="confirmacion-paso-descripcion"> Enviar comprobante por Whatsapp</span></p>

          <div className="confirmacion-botones-container">
            <button 
              className="confirmacion-boton confirmacion-boton-whatsapp"
              onClick={handleWhatsApp}
            >
              <img src={iconWhatsApp} alt="" aria-hidden="true" className="confirmacion-icono-boton-whatsapp" />
              Enviar por WhatsApp
            </button>
          </div>
          <p className="confirmacion-aclaracion-texto"><strong>Importante:</strong> Tu lugar quedará asegurado únicamente al enviar el comprobante.</p>

          <h2 className="confirmacion-saludo-cursiva">Te esperamos!</h2>
        </section>
      </main>

      <img src={iconWhatsApp} alt="WhatsApp" className="confirmacion-whatsapp" />
    </div>
  );
}

export default AlumnoConfirmacion;