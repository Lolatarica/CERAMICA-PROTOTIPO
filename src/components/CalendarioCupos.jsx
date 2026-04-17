import React from 'react';
import { formatClassTimeRange } from '../utils/timeFormat';

function CalendarioCupos({
  clase,
  turnosPorClase,
  turnosActuales,
  dias = [],
  horas = [],
  selectedDia,
  selectedHora,
  compacto = false,
  modoEdicion,
  turnoViendoDetalle,
  onSelectTurno,
  onCellClick
}) {
  const turnos =
    turnosActuales ??
    (turnosPorClase && clase ? turnosPorClase[clase] : {}) ??
    {};

  const colHoraWidth = compacto ? '78px' : '98px';
  const rowHeight = compacto ? '48px' : '52px';
  const fontSize = compacto ? '13px' : '14px';
  const rangoHoraStyle = {
    ...styles.rangoHora,
    whiteSpace: compacto ? 'normal' : 'nowrap',
    lineHeight: compacto ? '1.1' : '1',
    fontSize: compacto ? '11px' : '12px',
    padding: compacto ? '0 4px' : 0,
  };
  const wrapperClassName = compacto ? undefined : 'table-scroll table-scroll--calendar';
  const wrapperStyle = compacto ? { width: '100%' } : undefined;

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <table style={{ ...styles.calendarioContenedor, fontSize }}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={{ ...styles.thHeader, width: colHoraWidth }}></th>
            {dias.map((dia) => (
              <th key={dia} style={styles.thHeader}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((hora) => {
            const rangoHora = formatClassTimeRange(hora).replace(' - ', '–');

            return (
            <tr key={hora}>
              <td style={{ ...styles.celdaHora, width: colHoraWidth, height: rowHeight }}>
                <span style={rangoHoraStyle}>{rangoHora}</span>
              </td>
              {dias.map((dia) => {
                const idTurno = `${dia}-${hora}`;
                const cupos = turnos[idTurno];
                const hayClase = cupos !== undefined;
                const sinCupo = cupos === 0;
                const seleccionado =
                  (selectedDia === dia && selectedHora === hora) ||
                  (turnoViendoDetalle === idTurno);

                const estiloCelda = hayClase
                  ? {
                      ...styles.celdaBase,
                      height: rowHeight,
                      ...(sinCupo ? styles.celdaSinCupo : styles.celdaDisponible),
                      ...(seleccionado ? styles.celdaSeleccionadaVista : {})
                    }
                  : { ...styles.celdaBase, height: rowHeight, ...styles.celdaVacia };

                return (
                  <td
                    key={idTurno}
                    style={estiloCelda}
                    onClick={() => {
                      if (onCellClick) {
                        if ((hayClase && !sinCupo) || modoEdicion) onCellClick(idTurno, hayClase && !sinCupo);
                      } else if (onSelectTurno) {
                        if (hayClase && !sinCupo) onSelectTurno(dia, hora);
                      }
                    }}
                  >
                    {hayClase ? (sinCupo ? 'X' : cupos) : ''}
                  </td>
                );
              })}
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  calendarioContenedor: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed', // fuerza columnas iguales
    textAlign: 'center',
    fontSize: '14px'
  },
  headerRow: {
    backgroundColor: 'var(--color-marron-oscuro)',
    color: 'white'
  },
  thHeader: {
    height: '42px',
    padding: 0,
    fontWeight: 'bold'
  },
  celdaHora: {
    backgroundColor: '#C8A97E',
    color: 'var(--color-marron-oscuro)',
    fontWeight: 'bold',
    padding: 0,
    border: '1px solid white'
  },
  rangoHora: {
    height: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '-0.2px'
  },
  celdaBase: {
    padding: 0,
    border: '1px solid white',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  },
  // Cupos disponibles: blanco (no verde)
  celdaDisponible: {
    backgroundColor: '#EAEAEA', // con cupos, no seleccionados: gris
    color: '#7A7A7A',           // número gris
    cursor: 'pointer'
  },
  celdaSinCupo: {
    backgroundColor: '#f6dada',
    color: '#b42318',
    cursor: 'not-allowed'
  },
  // Sin clase definida: gris claro
  celdaVacia: {
    backgroundColor: '#FFFFFF', // sin cupo: blanco
    color: '#FFFFFF',
    cursor: 'default'
  },
  // Seleccionada: verde, sin borde extra
  celdaSeleccionadaVista: {
    backgroundColor: '#95B89F', // seleccionada: verde
    color: 'white'
  }
};

export default CalendarioCupos;