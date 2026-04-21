import type { ActivityParkingRegistration } from '../Types/attendanceNew';

const csvCell = (value: string | null | undefined): string =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

const parkingOriginLabel = (source: ActivityParkingRegistration['source']): string =>
  source === 'admin' ? 'Admin' : 'Enlace público';

/** UTF-8 BOM + header row + data rows for parking registrations (opens cleanly in Excel). */
export function formatParkingRegistrationsAsCsv(rows: ActivityParkingRegistration[]): string {
  const headers = ['Placa', 'Nombre', 'Cédula', 'Teléfono', 'Origen', 'Fecha registro'];
  const csvRows = rows.map((r) =>
    [
      csvCell(r.plate_raw),
      csvCell(r.full_name),
      csvCell(r.cedula),
      csvCell(r.phone),
      csvCell(parkingOriginLabel(r.source)),
      csvCell(r.created_at ? new Date(r.created_at).toLocaleString('es-ES') : ''),
    ].join(',')
  );
  return '\ufeff' + [headers.join(','), ...csvRows].join('\n');
}
