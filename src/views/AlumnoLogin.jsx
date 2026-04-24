// src/views/AlumnoLogin.jsx
import React, { useState } from 'react';
// Importamos los assets (asegurate de tener las imágenes ahí)
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';

// Importamos nuestros componentes reutilizables
import InputSimple from '../components/InputSimple';
import BotonPrincipal from '../components/BotonPrincipal';
import './AlumnoLogin.css'; // <-- Acordate de crear e importar este archivo

function AlumnoLogin({ onSiguiente, onAccesoProfesor }) {
  const TELEFONO_MINIMO_DIGITOS = 10;
  // Estado para guardar los datos del formulario (luego los usaremos)
  const [participanteAlternativo, setParticipanteAlternativo] = useState('');
  const [nombre, setNombre] = useState('');
  const [mail, setMail] = useState('');
  const [numero, setNumero] = useState(''); // El número lo simplificamos por ahora
  const [errores, setErrores] = useState({});

  const limpiarError = (campo) => {
    setErrores((erroresActuales) => {
      if (!erroresActuales[campo]) {
        return erroresActuales;
      }

      return {
        ...erroresActuales,
        [campo]: null,
      };
    });
  };

  const handleSiguiente = () => {
    const nombreLimpio = nombre.trim();
    const telefonoLimpio = numero.trim();
    const mailLimpio = mail.trim();

    const nuevosErrores = {
      nombre: !nombreLimpio
        ? 'Este casillero es obligatorio para continuar'
        : null,
      numero: !telefonoLimpio
        ? 'Este casillero es obligatorio para continuar'
        : telefonoLimpio.length < TELEFONO_MINIMO_DIGITOS
          ? `El telefono debe tener al menos ${TELEFONO_MINIMO_DIGITOS} numeros`
          : null,
      mail: !mailLimpio
        ? 'Este casillero es obligatorio para continuar'
        : !mailLimpio.includes('@')
          ? 'El mail debe incluir una arroba (@)'
          : null,
    };

    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some(Boolean)) {
      return;
    }

    onSiguiente();
  };

  const handleNombreChange = (e) => {
    const valorSinNumeros = e.target.value.replace(/\d/g, '');
    setNombre(valorSinNumeros);
    limpiarError('nombre');
  };

  const handleParticipanteAlternativoChange = (e) => {
    const valorSinNumeros = e.target.value.replace(/\d/g, '');
    setParticipanteAlternativo(valorSinNumeros);
  };

  const handleNumeroChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    setNumero(soloNumeros);
    limpiarError('numero');
  };

  const handleMailChange = (e) => {
    setMail(e.target.value);
    limpiarError('mail');
  };

  return (
    <div className="app-shell login-container">
      
      {/* HEADER: Marrón, Logo, Título */}
      <header className="app-header login-header">
        <img src={logoTaller} alt="Logo El taller de enfrente" className="login-logo" />
        <h1 className="login-title">Agenda tu clase!</h1>
      </header>

      {/* CUERPO: Formulario y Botón */}
      <main className="app-main desktop-centered-main login-body">
        <div className="content-shell content-shell--md login-form-stage">
          <h2 className="login-subtitle">Paso 1: Ingrese su información personal</h2>
          <p className="login-helper-text">Los casilleros con * son obligatorios.</p>

          <div className="login-form-content">
            <div className="login-form-grid">
              {/* Fila 1 */}
              <div className="login-form-cell">
                <label className="login-optional-label">
                  Si la clase es para otra persona, por favor ingrese el nombre y apellido de la persona que participara.
                </label>
                <input
                  type="text"
                  placeholder="Nombre y apellido de quien participara"
                  value={participanteAlternativo}
                  onChange={handleParticipanteAlternativoChange}
                  className="login-optional-input"
                />
              </div>
              <div className="login-form-cell">
                <InputSimple 
                  label="Nombre y Apellido/s *" 
                  placeholder="Nombre Apellido" 
                  value={nombre}
                  onChange={handleNombreChange}
                  error={errores.nombre}
                />
              </div>
              {/* Fila 2 */}
              <div className="login-form-cell">
                <InputSimple 
                  label="Mail *" 
                  type="email"
                  placeholder="mail@gmail.com" 
                  value={mail}
                  onChange={handleMailChange}
                  error={errores.mail}
                />
              </div>
              <div className="login-form-cell">
                <InputSimple 
                  label="Telefono/Celular *" 
                  placeholder="Ej: 1123456789" 
                  value={numero}
                  onChange={handleNumeroChange}
                  error={errores.numero}
                  inputMode="numeric"
                />
              </div>
            </div>

            <p className="login-aviso">
              Si usted ya se agendo una vez no es necesario agendarse todas las semanas.
            </p>

            <BotonPrincipal 
              text="Siguiente" 
              onClick={handleSiguiente} 
            />
            <p className="login-acceso-profesor" onClick={onAccesoProfesor}>
              Acceso Profesor
            </p>
          </div>
        </div>
      </main>

      {/* Ícono de WhatsApp Flotante */}
      <img src={iconWhatsApp} alt="WhatsApp" className="login-whatsapp" />

    </div>
  );
}

export default AlumnoLogin;