import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { getAPIBaseURL } from '../../../shared/Services/config';
import { getAuthHeader } from '../../Login/Services/auth';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandover: (userId: number) => Promise<void>;
  recordId: number;
  recordNumber: string;
  loading: boolean;
}

const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  onHandover,
  recordNumber,
  loading
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      
      // Fetch users from backend with shared base URL and auth header
      const apiBase = await getAPIBaseURL();
      const response = await fetch(`${apiBase}/users/eligible-for-handover`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Error al cargar usuarios');

      const list = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.data || [];
      setUsers(list);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleHandover = async () => {
    if (!selectedUserId) return;
    
    try {
      await onHandover(selectedUserId);
      onClose();
    } catch (err) {
      console.error('Error during handover:', err);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUserId(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Entregar Expediente a Usuario
              </h2>
              <p className="text-sm text-gray-600">
                Expediente: {recordNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Entregar Expediente
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    Al entregar este expediente a un usuario, el usuario podrá gestionar 
                    y modificar su propio expediente. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {loadingUsers ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedUserId === user.id
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || user.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.email}
                        </p>
                      </div>
                      {selectedUserId === user.id && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleHandover}
            disabled={!selectedUserId || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Entregando...
              </>
            ) : (
              'Entregar Expediente'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandoverModal;


