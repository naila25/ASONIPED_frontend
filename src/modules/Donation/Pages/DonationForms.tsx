import { useState, useEffect } from 'react';
import { getAuthHeader } from '../../Login/Services/auth';

interface DonationContact {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  aceptacion_privacidad: boolean;
  aceptacion_comunicacion: boolean;
  created_at?: string;
}

/**
 * Admin page for managing donation contact forms.
 * Allows viewing and deleting donation contacts.
 */
const DonationForms = () => {
  // State for donation contacts, loading, error
  const [contacts, setContacts] = useState<DonationContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch donation contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/donations', {
          headers: getAuthHeader()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setContacts(data);
      } catch {
        setError('Failed to load donation contacts');
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/donations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter(contact => contact.id !== id));
    } catch {
      setError('Error al eliminar la solicitud');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Cargando solicitudes...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Solicitudes de Contacto</h2>
      
      {contacts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No hay solicitudes de contacto
        </div>
      ) : (
        <div className="grid gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{contact.nombre}</h3>
                  <p className="text-gray-600">{contact.correo}</p>
                  <p className="text-gray-600">{contact.telefono}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {contact.created_at && formatDate(contact.created_at)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Asunto:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{contact.asunto}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Mensaje:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{contact.mensaje}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Aceptó privacidad: {contact.aceptacion_privacidad ? 'Sí' : 'No'}</p>
                  <p>Aceptó comunicación: {contact.aceptacion_comunicacion ? 'Sí' : 'No'}</p>
                </div>
                
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationForms;