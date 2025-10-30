import { useEffect, useState } from "react";
import { Settings, Save, KeyRound, Eye, EyeOff } from "lucide-react";
import { getCurrentUser, updateProfile, changePassword } from "../../../shared/Services/user.service";

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await getCurrentUser();
        setUsername(me.username || "");
        setName(me.name || "");
        setEmail(me.email || "");
        setPhone(me.phone || "");
      } catch {
        setError("No se pudo cargar tu perfil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!name.trim()) throw new Error("El nombre es requerido");
      // basic normalization: keep empty phone as null
      const normalizedPhone = phone.trim() === "" ? null : phone.trim();
      await updateProfile({ name: name.trim(), email: email.trim() || undefined, phone: normalizedPhone });
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setError((err as Error).message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    setError(null);
    setSuccess(null);
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Completa todos los campos de contraseña");
      }
      if (newPassword.length < 8) throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
      if (newPassword !== confirmPassword) throw new Error("Las contraseñas no coinciden");
      await changePassword({ currentPassword, newPassword });
      setSuccess("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError((err as Error).message || "No se pudo cambiar la contraseña");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Settings className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gestiona tu información personal y seguridad</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>
      )}

      {/* Perfil */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
        {loading ? (
          <div className="animate-pulse h-24 bg-gray-100 rounded" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                value={username}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">ID de usuario (solo lectura).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo de contacto</label>
              <input
                type="email"
                value={email}
                maxLength={30}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="8888-8888"
              />
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </form>

      {/* Contraseña */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
                placeholder="••••••••"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
                placeholder="••••••••"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
                placeholder="••••••••"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changingPwd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            Actualizar contraseña
          </button>
        </div>
      </form>
    </div>
  );
}

