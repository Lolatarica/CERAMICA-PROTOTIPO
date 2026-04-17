// src/views/AlumnoLogin.jsx
import React, { useState } from 'react';
// Importamos los assets (asegurate de tener las imágenes ahí)
import logoTaller from '../assets/logo_taller.png'; 
import iconWhatsApp from '../assets/whatsapp.png';

// Importamos nuestros componentes reutilizables
import InputSimple from '../components/InputSimple';
import BotonPrincipal from '../components/BotonPrincipal';

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

  // Estilos específicos para esta pantalla
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: '0 auto',  
      backgroundColor: 'var(--color-crema)',
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
      backgroundColor: 'white', // Fondo blanco circular si la imagen no lo tiene
      padding: '5px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      objectFit: 'cover' // Ajusta la imagen dentro del círculo
    },
    title: {
      color: '#E0C9A6',
      fontFamily: 'var(--font-titulo)', // <-- Nueva línea usando nuestra variable
      fontSize: '28px',
      margin: '2px 0 0 0',
    },
    bodyForm: {
      padding: '46px 30px 30px',
      flex: 1, // Ocupa el espacio restante
      display: 'flex',
      alignItems: 'center',
    },
    formStage: {
      width: '100%',
      maxWidth: '880px',
      margin: '0 auto',
    },
    subtitle: {
      textAlign: 'left',
      fontSize: '15px',
      fontWeight: '800',
      color: 'var(--color-marron-oscuro)',
      margin: '0 0 8px 0',
      lineHeight: '1.3',
    },
    helperText: {
      textAlign: 'left',
      fontSize: '13px',
      color: '#8b7b6f',
      margin: '0 0 24px 0',
      lineHeight: '1.35',
    },
    columnStack: {
      display: 'grid',
      gap: '18px',
      alignContent: 'start',
    },
    optionalLabel: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '500',
      color: '#8f857c',
      margin: '0 0 6px 0',
      lineHeight: '1.4',
    },
    optionalInput: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #d8d8d8',
      backgroundColor: '#f7f4ef',
      fontSize: '15px',
      color: '#5c5c5c',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
    },
    formContent: {
      transform: 'scale(0.96)',
      transformOrigin: 'top center',
      width: '100%',
    },
    aviso: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#666',
      margin: '30px 0',
      lineHeight: '1.4'
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

  return (
    <div className="app-shell" style={styles.container}>
      
      {/* HEADER: Marrón, Logo, Título */}
      <header className="app-header" style={styles.header}>
        <img src={logoTaller} alt="Logo El taller de enfrente" style={styles.logo} />
        <h1 style={styles.title}>Agenda tu clase!</h1>
      </header>

      {/* CUERPO: Formulario y Botón */}
      <main className="app-main desktop-centered-main" style={styles.bodyForm}>
        <div className="content-shell content-shell--md" style={styles.formStage}>
          <h2 style={styles.subtitle}>Paso 1: Ingrese su información personal</h2>
          <p style={styles.helperText}>Los casilleros con * son obligatorios.</p>

          <div style={styles.formContent}>
            <div className="desktop-form-grid">
              <div style={styles.columnStack}>
                <label style={styles.optionalLabel}>
                  Si la clase es para otra persona, por favor ingrese el nombre y apellido de la persona que participara.
                </label>
                <input
                  type="text"
                  placeholder="Nombre y apellido de quien participara"
                  value={participanteAlternativo}
                  onChange={handleParticipanteAlternativoChange}
                  style={styles.optionalInput}
                />

                <InputSimple 
                  label="Nombre y Apellido/s *" 
                  placeholder="Nombre Apellido" 
                  value={nombre}
                  onChange={handleNombreChange}
                  error={errores.nombre}
                />
              </div>

              <div style={styles.columnStack}>
                <InputSimple 
                  label="Mail *" 
                  type="email"
                  placeholder="mail@gmail.com" 
                  value={mail}
                  onChange={handleMailChange}
                  error={errores.mail}
                />

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

            <p style={styles.aviso}>
              Si usted ya se agendo una vez no es necesario agendarse todas las semanas.
            </p>

            <BotonPrincipal 
              text="Siguiente" 
              onClick={handleSiguiente} 
            />
            <p 
              style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onAccesoProfesor}
            >
              Acceso Profesor
            </p>
          </div>
        </div>
      </main>
      {/* Ícono de WhatsApp Flotante */}
      <img src={iconWhatsApp} alt="WhatsApp" style={styles.whatsapp} />


    </div>
    
    
  );
}

export default AlumnoLogin;