import React, { useState } from 'react';
import logoTaller from '../assets/logo_taller.png';
import BotonPrincipal from '../components/BotonPrincipal';

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

  const styles = {
    container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: '0 auto', backgroundColor: 'var(--color-crema)', position: 'relative' },
    header: { backgroundColor: 'var(--color-marron-oscuro)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 },
    titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { color: '#E0C9A6', fontFamily: 'var(--font-titulo)', fontSize: '24px', margin: 0 },
    backButton: { width: '24px', height: '24px', padding: 0, border: 'none', backgroundColor: 'transparent', color: '#E0C9A6', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logo: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'cover' },
    body: { padding: '20px', flex: 1 },
    tarjetaSucursal: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '15px' },
    tarjetaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
    tarjetaContenido: { cursor: 'pointer', flex: 1 },
    direccion: { fontSize: '13px', color: '#555', marginTop: '8px', marginBottom: 0, lineHeight: '1.4' },
    subtitulo: { fontSize: '12px', color: '#777', marginTop: '8px', marginBottom: 0 },
    acciones: { display: 'flex', flexDirection: 'column', gap: '8px' },
    botonSecundario: { border: 'none', backgroundColor: '#f5e6d2', color: '#1d1d1d', borderRadius: '14px', padding: '10px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 18px rgba(200, 169, 126, 0.22)' },
    botonEliminar: { border: 'none', backgroundColor: '#fff4f4', color: '#b42318', borderRadius: '14px', padding: '10px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 18px rgba(179, 35, 24, 0.10)' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: mostrarModal ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '24px', borderRadius: '20px', width: '92%', boxShadow: '0 22px 40px rgba(0,0,0,0.16)' },
    tituloModal: { color: 'var(--color-marron-oscuro)', marginTop: 0, marginBottom: '8px', fontSize: '20px' },
    labelForm: { display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#333' },
    inputNombre: { width: '100%', padding: '12px 15px', marginBottom: '18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', color: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
    inputDireccion: { width: '100%', padding: '12px 15px', marginBottom: '18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'var(--color-blanco)', fontSize: '16px', color: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
    accionesModal: { display: 'flex', gap: '10px' },
    botonModalSecundario: { flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#e9dcc9', color: 'var(--color-marron-oscuro)', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.16)' },
    botonModalPrincipal: { flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-marron-oscuro)', color: 'white', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  };

  return (
    <div className="app-shell app-shell--wide" style={styles.container}>
      <header className="app-header" style={styles.header}>
        <div style={styles.titleRow}>
          <button type="button" style={styles.backButton} onClick={onVolver} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={styles.title}>Panel del profesor</h1>
        </div>
        <img src={logoTaller} alt="Logo" style={styles.logo} />
      </header>

      <main className="app-main content-shell content-shell--lg" style={styles.body}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sucursales</h2>
        <div className="cards-grid cards-grid--2">
          {sucursales.map((sucursal) => (
            <div key={sucursal.id} style={styles.tarjetaSucursal}>
              <div style={styles.tarjetaHeader}>
                <div style={styles.tarjetaContenido} onClick={() => onSeleccionarSucursal(sucursal.id)}>
                  <h3 style={{ color: 'var(--color-marron-oscuro)', margin: 0 }}>{sucursal.nombre}</h3>
                  <p style={styles.direccion}>{sucursal.direccion}</p>
                  <p style={styles.subtitulo}>Tocá para ver las clases de esta sucursal</p>
                </div>
                <div style={styles.acciones}>
                  <button type="button" style={styles.botonSecundario} onClick={() => abrirModalEdicion(sucursal)}>Editar</button>
                  <button type="button" style={styles.botonEliminar} onClick={() => eliminarSucursal(sucursal)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <BotonPrincipal text="+ Nueva Sucursal" onClick={abrirModalNuevaSucursal} />
      </main>

      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h3 style={styles.tituloModal}>
            {sucursalEditando ? 'Editar sucursal' : 'Agregar sucursal'}
          </h3>
          <label style={styles.labelForm}>Nombre de la sucursal</label>
          <input
            style={styles.inputNombre}
            placeholder="Nombre de la sucursal..."
            value={nombreSucursal}
            onChange={(e) => setNombreSucursal(e.target.value)}
          />
          <label style={styles.labelForm}>Dirección</label>
          <input
            style={styles.inputDireccion}
            placeholder="Direccion de la sucursal..."
            value={direccionSucursal}
            onChange={(e) => setDireccionSucursal(e.target.value)}
          />
          <div style={styles.accionesModal}>
            <button onClick={cerrarModal} style={styles.botonModalSecundario}>Cancelar</button>
            <button onClick={guardarSucursal} style={styles.botonModalPrincipal}>
              {sucursalEditando ? 'Guardar cambios' : 'Guardar sucursal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfesorSucursales;