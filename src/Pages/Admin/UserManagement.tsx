
import { useState, useEffect } from 'react';
import { getAuthHeader } from '../../Utils/auth';

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

      const response = await fetch('http://localhost:3000/users', { headers });

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

      const response = await fetch('http://localhost:3000/users', {
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

      const response = await fetch(`http://localhost:3000/users/${editingAdmin.id}`, {
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

      const response = await fetch(`http://localhost:3000/users/${id}`, {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Administrador
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">{admin.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openModal(admin)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingAdmin ? 'Editar Administrador' : 'Agregar Administrador'}
            </h2>
            <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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