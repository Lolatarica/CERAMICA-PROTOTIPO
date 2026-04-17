// src/views/AlumnoConfirmacion.jsx
import React, { useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';
import { formatClassTimeRange } from '../utils/timeFormat';

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
      padding: '52px 14px 28px',
      flex: 1,
      display: 'block',
    },
    textoPrincipal: {
      fontSize: '26px',
      textAlign: 'center',
      color: '#161616',
      marginBottom: '18px',
      lineHeight: '1.25',
      fontWeight: '800'
    },
    textoSecundario: {
      fontSize: '18px',
      textAlign: 'center',
      color: '#333',
      lineHeight: '1.4',
      marginBottom: '24px',
      maxWidth: '380px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    resumenCard: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: '20px',
      padding: '20px 18px',
      boxSizing: 'border-box',
      boxShadow: '0 10px 24px rgba(93, 67, 51, 0.16)',
      marginBottom: 0
    },
    resumenFila: {
      display: 'block'
    },
    resumenFilaSeparada: {
      display: 'block',
      marginTop: '14px'
    },
    resumenTexto: {
      fontSize: '18px',
      color: '#6c7280',
      lineHeight: '1.35'
    },
    resumenLabel: {
      color: '#262626',
      fontWeight: '800'
    },
    pasoTexto: {
      fontSize: '18px',
      textAlign: 'left',
      color: 'var(--color-marron-oscuro)',
      fontWeight: '400',
      marginTop: '18px',
      marginBottom: '10px',
      width: '100%',
      marginBottom: '26px'
    },
    pasoDestacado: {
      fontWeight: '800'
    },
    pasoDescripcion: {
      fontWeight: '400'
    },
    textoPago: {
      fontSize: '18px',
      color: '#333',
      lineHeight: '1.6',
      marginTop: '6px',
      marginBottom: 0,
      width: '100%',
      textAlign: 'left'
    },
    aliasBox: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      border: '2px solid #e2cfb7',
      borderRadius: '16px',
      padding: '16px 14px',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(255,255,255,0.88)',
      marginBottom: 0
    },
    aliasTexto: {
      fontSize: '18px',
      color: '#222',
      lineHeight: '1.4',
      margin: 0,
      flex: 1
    },
    aliasValor: {
      fontWeight: '800'
    },
    botonCopiar: {
      border: 'none',
      backgroundColor: '#f5e6d2',
      color: '#1d1d1d',
      borderRadius: '14px',
      padding: '14px 18px',
      fontSize: '14px',
      fontWeight: '800',
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(200, 169, 126, 0.22)',
      whiteSpace: 'nowrap'
    },
    aclaracionTexto: {
      fontSize: '13px',
      color: '#454545',
      lineHeight: '1.4',
      marginTop: '16px',
      width: '100%',
      textAlign: 'center'
    },
    botonesContainer: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      width: '100%',
      marginTop: '8px'
    },
    boton: {
      padding: '18px 28px',
      borderRadius: '999px',
      border: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 22px rgba(37, 211, 102, 0.24)',
      flex: '0 1 340px',
      minWidth: '250px'
    },
    botonWhatsApp: {
      background: 'linear-gradient(135deg, #4cd97b 0%, #25D366 100%)',
      color: 'white'
    },
    iconoBotonWhatsApp: {
      width: '24px',
      height: '24px',
      objectFit: 'contain',
      marginRight: '10px',
      verticalAlign: 'middle'
    },
    saludoCursiva: {
      fontFamily: 'var(--font-titulo)',
      fontSize: '40px',
      color: 'var(--color-marron-oscuro)',
      marginTop: '22px',
      marginBottom: '8px'
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

  const handleWhatsApp = () => {
    window.open('https://wa.me/+541234567890', '_blank'); // Cambia el número por el de la profesora
  };

  return (
    <div className="app-shell" style={styles.container}>
      <header className="app-header" style={styles.header}>
        <img src={logoTaller} alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Agenda tu clase!</h1>
      </header>

      <main className="app-main desktop-confirm-grid" style={styles.body}>
        <section className="desktop-confirm-section desktop-confirm-section--summary" style={{ width: '100%' }}>
          <div style={styles.textoPrincipal}>
            ¡{nombre}, tu clase está casi lista!
          </div>

          <div style={styles.textoSecundario}>Te falta el último paso para confirmar tu reserva.</div>

          <div style={styles.resumenCard}>
            <div style={styles.resumenFila}>
              <div style={styles.resumenTexto}><span style={styles.resumenLabel}>Día:</span> {diaCompleto} del mes</div>
            </div>
            <div style={styles.resumenFilaSeparada}>
              <div style={styles.resumenTexto}><span style={styles.resumenLabel}>Hora:</span> {horaRango}</div>
            </div>
            <div style={styles.resumenFilaSeparada}>
              <div style={styles.resumenTexto}><span style={styles.resumenLabel}>Profesora:</span> {profesora}</div>
            </div>
          </div>
        </section>

        <section className="desktop-confirm-section desktop-confirm-section--payment" style={{ width: '100%' }}>
          <p style={styles.pasoTexto}><span style={styles.pasoDestacado}>Paso 5:</span><span style={styles.pasoDescripcion}> Reserva tu clase con un adelanto</span></p>
          <p style={styles.textoPago}>Monto para reservar la clase: <strong>$5000</strong></p>

          <div style={styles.aliasBox}>
            <p style={styles.aliasTexto}>Alias CBU/CVU: <span style={styles.aliasValor}>{aliasPago}</span></p>
            <button type="button" style={styles.botonCopiar} onClick={handleCopiarAlias}>
              {aliasCopiado ? 'COPIADO' : 'COPIAR ALIAS'}
            </button>
          </div>

          <p style={styles.pasoTexto}><span style={styles.pasoDestacado}>Paso 6:</span><span style={styles.pasoDescripcion}> Enviar comprobante por Whatsapp</span></p>

          <div style={styles.botonesContainer}>
            <button 
              style={{...styles.boton, ...styles.botonWhatsApp}}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
              onClick={handleWhatsApp}
            >
              <img src={iconWhatsApp} alt="" aria-hidden="true" style={styles.iconoBotonWhatsApp} />
              Enviar por WhatsApp
            </button>
          </div>
          <p style={styles.aclaracionTexto}><strong>Importante:</strong> Tu lugar quedará asegurado únicamente al enviar el comprobante.</p>

          <h2 style={styles.saludoCursiva}>Te esperamos!</h2>
        </section>


      </main>

      <img src={iconWhatsApp} alt="WhatsApp" style={styles.whatsapp} />
    </div>
  );
}

export default AlumnoConfirmacion;