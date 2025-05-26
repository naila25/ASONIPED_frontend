import { useState } from 'react';
import ListaAsistencia from '../../Components/Asistencia/ListaAsistencia';
import TablaListaAsistencia from '../../Components/Asistencia/TablaListaAsistencia';

type Attendance = {
  nombre: string;
  cedula: string;
  tipo: string;
};

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);

  const handleNewAttendance = (newRecord: Attendance) => {
    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Administración de Asistencia</h1>
      <div className="space-y-8">
        <ListaAsistencia onNewAttendance={handleNewAttendance} />
        <TablaListaAsistencia registros={attendanceRecords} />
      </div>
    </div>
  );
};

export default AttendancePage;