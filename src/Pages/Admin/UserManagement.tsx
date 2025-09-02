
import { useState, useEffect } from 'react';
import { getAuthHeader } from '../../Utils/auth';
import { API_BASE_URL } from '../../Utils/config';
import { Users, Plus, Edit, Trash2, Shield, Search } from 'lucide-react';

interface Admin {
  id: number;
  username: string;
}

interface AdminFormData {
  username: string;
  password: string;
}

const UserManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_BASE_URL}/users`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
    } catch {
      setError('Error loading admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create admin');
      }

      await fetchAdmins();
      setIsModalOpen(false);
      setFormData({ username: '', password: '' });
    } catch {
      setError('Error creating admin');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_BASE_URL}/users/${editingAdmin.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin');
      }

      await fetchAdmins();
      setIsModalOpen(false);
      setEditingAdmin(null);
      setFormData({ username: '', password: '' });
    } catch {
      setError('Error updating admin');
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este administrador?')) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      await fetchAdmins();
    } catch {
      setError('Error deleting admin');
    }
  };

  const openModal = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ username: admin.username, password: '' });
    } else {
      setEditingAdmin(null);
      setFormData({ username: '', password: '' });
    }
    setIsModalOpen(true);
  };

  // Filter admins by search term
  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Cargando administradores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <Shield className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gestión de Usuarios</h1>
            <p className="text-gray-600 text-sm sm:text-base">Administra los usuarios del sistema</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Nuevos Hoy</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <Plus className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Administradores</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar administradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Administrador</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Usuario</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-16">
                        {admin.id}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-32">
                        <div className="text-sm font-medium text-gray-900 truncate" title={admin.username}>
                          {admin.username}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-24">
                        <div className="flex flex-col sm:flex-row gap-1">
                          <button
                            onClick={() => openModal(admin)}
                            className="flex items-center justify-center gap-1 px-1 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            <Edit className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">E</span>
                            <span className="sm:hidden">E</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="flex items-center justify-center gap-1 px-1 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">D</span>
                            <span className="sm:hidden">D</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron administradores que coincidan con la búsqueda' : 'No hay administradores registrados'}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingAdmin && '(dejar vacío para mantener la actual)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required={!editingAdmin}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingAdmin ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;