function padMinutes(minutes) {
  return String(minutes).padStart(2, '0');
}

export function formatClassTimeRange(startTime) {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return startTime;
  }

  const [hoursText, minutesText] = startTime.split(':');
  const startHours = Number(hoursText);
  const startMinutes = Number(minutesText);

  if (Number.isNaN(startHours) || Number.isNaN(startMinutes)) {
    return startTime;
  }

  const endTotalMinutes = startHours * 60 + startMinutes + 120;
  const endHours = Math.floor(endTotalMinutes / 60) % 24;
  const endMinutes = endTotalMinutes % 60;

  return `${startHours}:${padMinutes(startMinutes)} - ${endHours}:${padMinutes(endMinutes)}`;
}

export function formatScheduleLabel(scheduleText) {
  if (!scheduleText) {
    return scheduleText;
  }

  const parts = scheduleText.trim().split(/\s+/);
  const lastPart = parts.at(-1);

  if (!lastPart || !/^\d{2}:\d{2}$/.test(lastPart)) {
    return scheduleText;
  }

  return `${parts.slice(0, -1).join(' ')} ${formatClassTimeRange(lastPart)}`.trim();
}

export function formatTurnoId(turnoId) {
  if (!turnoId || !turnoId.includes('-')) {
    return turnoId;
  }

  const [dia, hora] = turnoId.split('-');
  return `${dia} ${formatClassTimeRange(hora)}`;
}