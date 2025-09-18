import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const ForgotPassword = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setError("Por favor ingrese su email o nombre de usuario.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const base = await import("../../../shared/Services/config").then(m => m.getAPIBaseURL());
      const response = await fetch(`${base}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: emailOrUsername.trim() }),
      });

      if (response.ok) {
        setSuccess("Si el usuario existe, se envió un correo de recuperación.");
      } else {
        const data = await response.json();
        setError(data.error || "Error al procesar la solicitud.");
      }
    } catch (err) {
      setError("Error de conexión. Verifique su conexión a internet.");
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate({ to: "/" })}
            className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-gray-400 text-sm">
            Ingrese su email o nombre de usuario para recibir un enlace de recuperación
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
            className="bg-green-600/20 border border-green-500/50 text-green-300 text-sm p-3 rounded-lg mb-4"
          >
            {success}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Email o Nombre de Usuario
            </label>
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-2 border border-gray-600 focus-within:border-blue-500 transition-colors">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="usuario@email.com o nombre_usuario"
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate({ to: "/admin/login" })}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            ¿Recordó su contraseña? Iniciar sesión
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
