// src/views/ProfesorDashboard.jsx
import React, { useState } from 'react';
import './ProfesorDashboard.css';
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

  return (
    <div className="app-shell app-shell--wide dashboard-container">
      
      {/* HEADER DEL PROFESOR */}
      <header className="app-header dashboard-header">
        <h1 className="dashboard-title">Panel del profesor</h1>
        <div className="dashboard-logo-container">
          <img src={logoTaller} alt="Logo" className="dashboard-logo" />
          <span className="dashboard-logout" onClick={onLogout}>
            Salir
          </span>
        </div>
      </header>

      <main className="app-main content-shell content-shell--xl dashboard-body">
        <div className="split-layout split-layout--dashboard dashboard-responsive">
          <div className="dashboard-table-fullwidth">
            {/* TABLA DE AGENDAMIENTOS */}
            <div className="dashboard-tabla-card">
              <div className="dashboard-tabla-titulo-contenedor">
                <h2 className="dashboard-tabla-titulo">Agendamientos recientes</h2>
              </div>
              <div className="dashboard-tabla-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-thead-row">
                      <th className="dashboard-th dashboard-th-alumno">Alumnos</th>
                      <th className="dashboard-th dashboard-th-clase">Clase</th>
                      <th className="dashboard-th dashboard-th-horario">Horario</th>
                      <th className="dashboard-th dashboard-th-accion"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamientosRecientes.map((reserva, index) => (
                      <tr key={reserva.id} className={index % 2 !== 0 ? "dashboard-tr-gris" : ""}>
                        <td className="dashboard-td">{reserva.alumno}</td>
                        <td className="dashboard-td">{reserva.clase}</td>
                        <td className="dashboard-td">{formatScheduleLabel(reserva.horario)}</td>
                        <td className="dashboard-td-accion">
                          <button
                            type="button"
                            className="dashboard-boton-comprobante"
                            onClick={() => marcarComprobanteInicial(reserva.id)}
                          >
                            Comprobante inicial
                          </button>
                        </td>
                      </tr>
                    ))}
                    {agendamientosRecientes.length === 0 && (
                      <tr>
                        <td className="dashboard-tabla-vacia" colSpan={4}>
                          No hay agendamientos pendientes de comprobante.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="dashboard-botones-fullwidth">
            {/* BOTONERA PRINCIPAL */}
            <div className="actions-grid actions-grid--2 sticky-desktop dashboard-botones-container">
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
        </div>
      </main>
    </div>
  );
}

export default ProfesorDashboard;