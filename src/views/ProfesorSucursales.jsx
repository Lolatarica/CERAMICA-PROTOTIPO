// src/views/ProfesorSucursales.jsx
import React, { useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import BotonPrincipal from '../components/BotonPrincipal';
import './ProfesorSucursales.css'; // <-- Acordate de crear e importar el archivo CSS

function ProfesorSucursales({ sucursales, onVolver, onAgregarSucursal, onEditarSucursal, onEliminarSucursal, onSeleccionarSucursal }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombreSucursal, setNombreSucursal] = useState('');
  const [direccionSucursal, setDireccionSucursal] = useState('');
  const [sucursalEditando, setSucursalEditando] = useState(null);

  const guardarSucursal = () => {
    if (!nombreSucursal.trim()) {
      alert('Ponele un nombre a la sucursal');
      return;
    }

    if (!direccionSucursal.trim()) {
      alert('Agregá la direccion de la sucursal');
      return;
    }

    const guardadoOk = sucursalEditando
      ? onEditarSucursal(sucursalEditando.id, nombreSucursal, direccionSucursal)
      : onAgregarSucursal(nombreSucursal, direccionSucursal);

    if (!guardadoOk) {
      alert('No se pudo guardar la sucursal. Revisá si ya existe una con ese nombre.');
      return;
    }

    setMostrarModal(false);
    setNombreSucursal('');
    setDireccionSucursal('');
    setSucursalEditando(null);
  };

  const abrirModalNuevaSucursal = () => {
    setSucursalEditando(null);
    setNombreSucursal('');
    setDireccionSucursal('');
    setMostrarModal(true);
  };

  const abrirModalEdicion = (sucursal) => {
    setSucursalEditando(sucursal);
    setNombreSucursal(sucursal.nombre);
    setDireccionSucursal(sucursal.direccion || '');
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setSucursalEditando(null);
    setNombreSucursal('');
    setDireccionSucursal('');
  };

  const eliminarSucursal = (sucursal) => {
    const confirmarEliminacion = window.confirm(`¿Eliminar la sucursal ${sucursal.nombre}?`);

    if (!confirmarEliminacion) {
      return;
    }

    onEliminarSucursal(sucursal.id);
  };

  return (
    <div className="app-shell app-shell--wide sucursales-container">
      <header className="app-header sucursales-header">
        <div className="sucursales-title-row">
          <button type="button" className="sucursales-back-button" onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="sucursales-title">Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" className="sucursales-logo" />
      </header>

      <main className="app-main content-shell content-shell--lg sucursales-body">
        <h2 className="sucursales-titulo-seccion">Sucursales</h2>
        <div className="cards-grid cards-grid--2">
          {sucursales.map((sucursal) => (
            <div key={sucursal.id} className="sucursales-tarjeta-sucursal">
              <div className="sucursales-tarjeta-header">
                <div className="sucursales-tarjeta-contenido" onClick={() => onSeleccionarSucursal(sucursal.id)}>
                  <h3 className="sucursales-nombre">{sucursal.nombre}</h3>
                  <p className="sucursales-direccion">{sucursal.direccion}</p>
                  <p className="sucursales-subtitulo">Tocá para ver las clases de esta sucursal</p>
                </div>
                <div className="sucursales-acciones">
                  <button type="button" className="sucursales-boton-secundario" onClick={() => abrirModalEdicion(sucursal)}>Editar</button>
                  <button type="button" className="sucursales-boton-eliminar" onClick={() => eliminarSucursal(sucursal)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <BotonPrincipal text="+ Nueva Sucursal" onClick={abrirModalNuevaSucursal} />
      </main>

      <div className={`sucursales-overlay ${mostrarModal ? 'sucursales-overlay--visible' : ''}`}>
        <div className="sucursales-modal">
          <h3 className="sucursales-titulo-modal">
            {sucursalEditando ? 'Editar sucursal' : 'Agregar sucursal'}
          </h3>
          <label className="sucursales-label-form">Nombre de la sucursal</label>
          <input
            className="sucursales-input-nombre"
            placeholder="Nombre de la sucursal..."
            value={nombreSucursal}
            onChange={(e) => setNombreSucursal(e.target.value)}
          />
          <label className="sucursales-label-form">Dirección</label>
          <input
            className="sucursales-input-direccion"
            placeholder="Direccion de la sucursal..."
            value={direccionSucursal}
            onChange={(e) => setDireccionSucursal(e.target.value)}
          />
          <div className="sucursales-acciones-modal">
            <button onClick={cerrarModal} className="sucursales-boton-modal-secundario">Cancelar</button>
            <button onClick={guardarSucursal} className="sucursales-boton-modal-principal">
              {sucursalEditando ? 'Guardar cambios' : 'Guardar sucursal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfesorSucursales;