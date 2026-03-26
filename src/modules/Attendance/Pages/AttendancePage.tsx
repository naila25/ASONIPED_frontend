import { useEffect, useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ListaAsistencia from '../Components/ListaAsistencia';
import TablaListaAsistencia from '../Components/TablaListaAsistencia';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import AttendanceSubNav from '../Components/AttendanceSubNav';
import { fetchAttendance, addAttendance } from '../Services/attendanceApi';
import type { Attendance } from '../Types/attendance';

function RecordsSkeleton() {
  return (
    <div className="mt-8 space-y-3" aria-busy="true" aria-label="Cargando registros">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 md:h-14" />
      ))}
    </div>
  );
}

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendance();
      setAttendanceRecords(data);
      setError(null);
    } catch {
      setError('No se pudieron cargar los registros de asistencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleNewAttendance = async (newRecord: Omit<Attendance, 'id' | 'created_at'>) => {
    try {
      await addAttendance(newRecord);
      await loadAttendance();
      setError(null);
    } catch {
      setError('No se pudo guardar el registro. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        icon={<FaClipboardList className="h-6 w-6" />}
        title="Asistencia (formulario clásico)"
        description="Registro manual por nombre, cédula y tipo. Vista previa de la tabla de registros."
      />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <AttendanceSubNav className="mb-8 border-t-0 border-b border-gray-100 pb-6 pt-0" />
          <ListaAsistencia onNewAttendance={handleNewAttendance} />
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? <RecordsSkeleton /> : <TablaListaAsistencia registros={attendanceRecords} />}
      </div>
    </div>
  );
};

export default AttendancePage;
