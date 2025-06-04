import { useEffect, useState } from 'react';
import ListaAsistencia from '../../Components/Asistencia/ListaAsistencia';
import TablaListaAsistencia from '../../Components/Asistencia/TablaListaAsistencia';
import { fetchAttendance, addAttendance } from '../../Utils/attendanceApi';
import type { Attendance } from '../../types/attendance';

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
      setError('Error fetching attendance records.');
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
    } catch {
      setError('Error adding attendance record.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl  text-center mb-8"> Asistencia</h1>
      <div className="space-y-8">
        <ListaAsistencia onNewAttendance={handleNewAttendance} />
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <TablaListaAsistencia registros={attendanceRecords} />
        )}
      </div>
    </div>
  );
};

export default AttendancePage;