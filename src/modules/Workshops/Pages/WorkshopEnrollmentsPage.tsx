import { useState, useEffect } from 'react';
import { getUserEnrollments } from '../Services/workshopEnrollments';
import type { WorkshopEnrollmentWithDetails } from '../Types/workshop';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { cancelWorkshopEnrollment } from '../Services/workshopEnrollments';

export const WorkshopEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<WorkshopEnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (workshopId: number, workshopTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres cancelar tu inscripción en "${workshopTitle}"?`)) {
      return;
    }

    try {
      await cancelWorkshopEnrollment(workshopId);
      await loadEnrollments(); // Reload to update the list
      alert('Inscripción cancelada exitosamente');
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la inscripción');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEnrollments}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-500 text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No tienes inscripciones</h2>
          <p className="text-gray-600 mb-4">
            Aún no te has inscrito en ningún taller. Explora los talleres disponibles y únete a los que te interesen.
          </p>
          <a
            href="/"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 inline-block"
          >
            Ver Talleres Disponibles
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Inscripciones en Talleres</h1>
          <p className="text-gray-600">Gestiona tus inscripciones en talleres</p>
        </div>

        <div className="grid gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollment.workshop_title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-orange-500" />
                      {formatDate(enrollment.workshop_fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-orange-500" />
                      {formatTime(enrollment.workshop_hora)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-orange-500" />
                      {enrollment.workshop_ubicacion}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'enrolled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {enrollment.status === 'enrolled' ? 'Inscrito' : 'Cancelado'}
                  </span>
                  {enrollment.status === 'enrolled' && (
                    <button
                      onClick={() => handleCancelEnrollment(enrollment.workshop_id, enrollment.workshop_title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancelar inscripción"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Inscrito el {formatDate(enrollment.enrollment_date)}
                  </span>
                  {enrollment.notes && (
                    <div className="text-right">
                      <p className="font-medium text-gray-700">Notas:</p>
                      <p className="text-gray-600">{enrollment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopEnrollmentsPage;
