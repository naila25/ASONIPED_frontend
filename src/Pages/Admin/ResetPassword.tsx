
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para mostrar/ocultar contraseñas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      setSuccess("");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setSuccess("");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("✅ Tu contraseña ha sido restablecida exitosamente.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] px-4">
      <div className="bg-[#0f172a] w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-700">
        
     
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Restablecer Contraseña
        </h2>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-600 text-white text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-600 text-white text-sm p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
         
          <div>
            <label className="block text-gray-300 text-sm mb-2">Contraseña actual</label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Nueva contraseña</label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Confirmar contraseña</label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-2 rounded-lg font-semibold transition"
          >
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

