// src/views/ProfesorDashboard.jsx
import React, { useState } from 'react';
import logoTaller from '../assets/logo_taller.png'; 
import BotonPrincipal from '../components/BotonPrincipal';
import { formatScheduleLabel } from '../utils/timeFormat';

function ProfesorDashboard({ onLogout, onIrAClases, onIrACupos, onIrASucursales, onIrAAlumnos, onIrAPagos }) {
  const [agendamientosRecientes, setAgendamientosRecientes] = useState([
    { id: 1, alumno: 'María López', clase: 'Taller de cerámica', horario: 'Lun 10:00' },
    { id: 2, alumno: 'Juan Pérez', clase: 'Taller de cerámica', horario: 'Mar 16:00' },
    { id: 3, alumno: 'Ana Gómez', clase: 'Taller de pintura', horario: 'Mie 14:00' },
    { id: 4, alumno: 'Lucas Silva', clase: 'Taller de cerámica', horario: 'Jue 10:30' },
  ]);

  const marcarComprobanteInicial = (idReserva) => {
    setAgendamientosRecientes((reservasActuales) =>
      reservasActuales.filter((reserva) => reserva.id !== idReserva)
    );
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: '0 auto',
      backgroundColor: 'var(--color-crema)'
    },
    // El header ahora es flexbox para poner título a la izquierda y logo a la derecha
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
    title: {
      color: '#E0C9A6',
      fontFamily: 'var(--font-titulo)',
      fontSize: '28px',
      margin: 0,
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logo: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '2px',
      objectFit: 'cover'
    },
    logout: {
      color: '#E0C9A6',
      fontSize: '12px',
      marginTop: '5px',
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    body: {
      padding: '22px 10px 24px',
      flex: 1,
    },
    // Estilos de la tabla de agendamientos
    tablaCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden', // Para que los bordes redondeados corten la tabla
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '26px'
    },
    tablaTituloContenedor: {
      backgroundColor: '#C8A97E',
      padding: '16px 12px',
      textAlign: 'center',
    },
    tablaTitulo: {
      fontFamily: 'var(--font-titulo)',
      fontSize: '22px',
      color: 'var(--color-marron-oscuro)',
      margin: 0
    },
    tablaWrap: {
      width: '100%',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      textAlign: 'center',
      fontSize: '13px',
      tableLayout: 'fixed'
    },
    theadRow: {
      backgroundColor: 'var(--color-marron-oscuro)'
    },
    th: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '11px 4px',
      fontWeight: 'normal',
      border: 'none'
    },
    thAlumno: {
      width: '22%'
    },
    thClase: {
      width: '24%'
    },
    thHorario: {
      width: '24%'
    },
    thAccion: {
      width: '30%'
    },
    td: {
      padding: '10px 4px',
      color: '#333',
      verticalAlign: 'middle',
      lineHeight: '1.25',
      wordBreak: 'break-word'
    },
    tdAccion: {
      padding: '8px 4px',
      verticalAlign: 'middle'
    },
    // Fila gris alternada
    trGris: {
      backgroundColor: '#EAEAEA'
    },
    botonComprobanteInicial: {
      width: '100%',
      padding: '9px 8px',
      minHeight: '56px',
      borderRadius: '14px',
      border: 'none',
      backgroundColor: '#d9eef7',
      color: '#205b73',
      fontWeight: '800',
      fontSize: '11px',
      lineHeight: '1.15',
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(120, 180, 206, 0.24)'
    },
    tablaVacia: {
      padding: '18px 12px',
      textAlign: 'center',
      color: '#777'
    },
    botonesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px' // Espacio entre botones
    }
  };

  return (
    <div className="app-shell app-shell--wide" style={styles.container}>
      
      {/* HEADER DEL PROFESOR */}
      <header className="app-header" style={styles.header}>
        <h1 style={styles.title}>Panel del profesor</h1>
        <div style={styles.logoContainer}>
          <img src={logoTaller} alt="Logo" style={styles.logo} />
          <span style={styles.logout} onClick={onLogout}>
            Salir
          </span>
        </div>
      </header>

      <main className="app-main content-shell content-shell--xl" style={styles.body}>
        <div className="split-layout split-layout--dashboard">
        
        {/* TABLA DE AGENDAMIENTOS */}
        <div style={styles.tablaCard}>
          <div style={styles.tablaTituloContenedor}>
            <h2 style={styles.tablaTitulo}>Agendamientos recientes</h2>
          </div>
          <div style={styles.tablaWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, ...styles.thAlumno }}>Alumnos</th>
                  <th style={{ ...styles.th, ...styles.thClase }}>Clase</th>
                  <th style={{ ...styles.th, ...styles.thHorario }}>Horario</th>
                  <th style={{ ...styles.th, ...styles.thAccion }}></th>
                </tr>
              </thead>
              <tbody>
                {agendamientosRecientes.map((reserva, index) => (
                  <tr key={reserva.id} style={index % 2 !== 0 ? styles.trGris : {}}>
                    <td style={styles.td}>{reserva.alumno}</td>
                    <td style={styles.td}>{reserva.clase}</td>
                    <td style={styles.td}>{formatScheduleLabel(reserva.horario)}</td>
                    <td style={styles.tdAccion}>
                      <button
                        type="button"
                        style={styles.botonComprobanteInicial}
                        onClick={() => marcarComprobanteInicial(reserva.id)}
                      >
                        Comprobante inicial
                      </button>
                    </td>
                  </tr>
                ))}
                {agendamientosRecientes.length === 0 && (
                  <tr>
                    <td style={styles.tablaVacia} colSpan={4}>
                      No hay agendamientos pendientes de comprobante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTONERA PRINCIPAL */}
        <div className="actions-grid actions-grid--2 sticky-desktop" style={styles.botonesContainer}>
          <BotonPrincipal 
            text="Gestionar cupos" 
            onClick={onIrACupos} 
          />
          <BotonPrincipal 
            text="Gestionar clases" 
            onClick={onIrAClases} 
          />
          <BotonPrincipal
            text="Sucursales"
            onClick={onIrASucursales}
          />
          <BotonPrincipal 
            text="Alumnos" 
            onClick={onIrAAlumnos}
          />
          <BotonPrincipal
            text="Control de pagos"
            onClick={onIrAPagos}
          />
        </div>
        </div>

      </main>
    </div>
  );
}

export default ProfesorDashboard;