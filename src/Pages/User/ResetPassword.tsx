import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Get token from URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    setToken(tokenParam);
    
    if (!tokenParam) {
      setError("Token de recuperación no válido. Solicite un nuevo enlace.");
    }
  }, []);

  const validatePassword = (password: string): boolean => {
    // Only require non-empty password per backend
    return password.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Token de recuperación no válido.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("La contraseña es requerida.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const base = await import("../../Utils/config").then(m => m.getAPIBaseURL());
      const response = await fetch(`${base}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (response.ok) {
        setSuccess("Contraseña actualizada exitosamente. Redirigiendo al login...");
        setTimeout(() => window.location.href = "/admin/login", 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Error al restablecer la contraseña.");
      }
    } catch {
      setError("Error de conexión. Verifique su conexión a internet.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Token Inválido</h2>
          <p className="text-gray-400 mb-6">
            El enlace de recuperación no es válido. Solicite un nuevo enlace.
          </p>
          <button
            onClick={() => window.location.href = "/forgot-password"}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Solicitar Nuevo Enlace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0f172a] w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => window.location.href = "/forgot-password"}
            className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Nueva Contraseña
          </h2>
          <p className="text-gray-400 text-sm">
            Ingrese su nueva contraseña para completar la recuperación
          </p>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-600/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-600/20 border border-green-500/50 text-green-300 text-sm p-3 rounded-lg mb-4 flex items-center"
          >
            <CheckCircle className="mr-2" size={18} />
            {success}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Nueva Contraseña
            </label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2 border border-gray-600 focus-within:border-green-500 transition-colors">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingrese su nueva contraseña"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Confirmar Contraseña
            </label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2 border border-gray-600 focus-within:border-green-500 transition-colors">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = "/admin/login"}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            ¿Recordó su contraseña? Iniciar sesión
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
