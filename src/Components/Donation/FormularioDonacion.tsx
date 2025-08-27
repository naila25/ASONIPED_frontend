import { motion } from "framer-motion";
import { FaMoneyBillWave, FaGift, FaMobileAlt, FaUniversity } from "react-icons/fa";
import { useState } from "react";
import quienessomos from "../../assets/quienessomos.png";
import manoscoloridas from "../../assets/profile-pictures/manoscoloridas.png";
import type { DonationFormData } from "../../Utils/donationService";
import { submitDonation, validateDonationForm, formatPhoneNumber } from "../../Utils/donationService";

const DonacionesVisual = () => {
  const [formData, setFormData] = useState<DonationFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    aceptacion_privacidad: false,
    aceptacion_comunicacion: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors = validateDonationForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DonationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const result = await submitDonation(formData);

    if (result.success) {
      setSubmitStatus('success');
      setSubmitMessage(result.message);
      setFormData({
        nombre: '',
        correo: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        aceptacion_privacidad: false,
        aceptacion_comunicacion: false
      });
    } else {
      setSubmitStatus('error');
      setSubmitMessage(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <section className="relative min-h-screen bg-white px-6 py-10 flex flex-col items-center gap-3">

      {/* Título principal */}
      <motion.h2
        className="text-orange-500 text-4xl font-bold text-center mb-4 tracking-wide"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        ¿Por qué donar?
      </motion.h2>

      <motion.p
        className="text-gray-800 max-w-3xl text-center mb-6 text-lg"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        Cada donación que recibimos es una oportunidad para transformar vidas. En ASONIPED trabajamos día a día
        para brindar apoyo a personas con discapacidad y a sus familias. Tu ayuda nos permite ofrecer talleres,
        entregas de víveres, asistencia técnica y mucho más.
      </motion.p>

      {/* FORMAS DE DONACIÓN */}
      <motion.h3
        className="text-orange-500 text-3xl font-bold text-center mb-4 tracking-wide"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        Formas de donación

        <div className="flex items-center justify-center mt-6 gap-3">
          <div className="w-20 h-[2px] bg-orange-400 rounded"></div>
          <img src={manoscoloridas} alt="Logo manos" className="w-12 h-12 object-contain" />
          <div className="w-20 h-[2px] bg-orange-400 rounded"></div>
        </div>
      </motion.h3>

      <div className="flex flex-col gap-15 w-full max-w-6xl">
        {/* Donación Económica */}
        <motion.div
          className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <FaMoneyBillWave className="text-orange-500 text-2xl mr-3" />
              <h4 className="text-xl font-bold text-orange-500">Donación Económica</h4>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FaMobileAlt className="text-orange-500 mr-2" /> Sinpe Móvil:
            </p>
            <p className="text-orange-500 font-medium mb-3 ml-6">8888-8888</p>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FaUniversity className="text-orange-500 mr-2" /> Cuenta Bancaria:
            </p>
            <p className="text-orange-500 font-medium ml-6">IBAN: CR05000123456789123456</p>
          </div>

          <div className="w-full md:w-1/2 h-full p-4">
            <img
              src={quienessomos}
              alt="quienessomos"
              className="object-cover w-full h-full rounded-3xl"
            />
          </div>
        </motion.div>

        {/* Donación en Especie */}
        <motion.div
          className="flex flex-col md:flex-row-reverse items-center bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <FaGift className="text-orange-500 text-2xl mr-3" />
              <h4 className="text-xl font-bold text-orange-500">Donación en Especie</h4>
            </div>

            <p className="text-gray-700 mt-3">Puedes donar alimentos, ropa, víveres y otros artículos útiles. Contáctanos para coordinar la entrega en nuestras oficinas.</p>
          </div>

          <div className="w-full md:w-1/2 h-full p-4">
            <img
              src={quienessomos}
              alt="quienessomos"
              className="object-cover w-full h-full rounded-3xl"
            />
          </div>
        </motion.div>
      </div>

      {/* FORMULARIO + PREGUNTAS FRECUENTES */}
      <motion.div
        className="w-full max-w-6xl bg-white border border-gray-200 rounded-xl shadow-xl p-10 mb-12 mt-16"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >

        <h2 className="text-center text-3xl font-extrabold text-orange-500 mb-12">
          Resolvemos tus dudas
        </h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-start">
          {/* Preguntas Frecuentes estilo acordeón */}
          <div>
            <h3 className="text-xl font-bold text-black mb-6">Preguntas frecuentes</h3>

            <div className="space-y-4">
              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Cómo puedo hacer una donación?
                  <span className="transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2 text-gray-700">
                  Puedes realizar tu donación a través de transferencia bancaria, sinpe móvil o directamente en nuestras oficinas.
                </p>
              </details>

              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Hay un monto mínimo para donar?
                  <span className="transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2 text-gray-700">
                  No, cualquier aporte es bien recibido. Toda ayuda, grande o pequeña, hace la diferencia.
                </p>
              </details>

              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Cómo puedo colaborar con la asociación?
                  <span className="transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2 text-gray-700">
                  Puedes donar, ser voluntario o participar en nuestras actividades. Escríbenos para más información.
                </p>
              </details>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="text-black grid grid-cols-1 gap-4">
            <p className="text-gray-700">Déjanos tu mensaje</p>
            
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                className={`border ${errors.correo ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Teléfono (88888888)"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', formatPhoneNumber(e.target.value))}
                className={`border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Asunto (mínimo 10 caracteres)"
                value={formData.asunto}
                onChange={(e) => handleInputChange('asunto', e.target.value)}
                className={`border ${errors.asunto ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.asunto && <p className="text-red-500 text-sm mt-1">{errors.asunto}</p>}
            </div>

            <div>
              <textarea
                placeholder="Mensaje (mínimo 10 caracteres)"
                value={formData.mensaje}
                onChange={(e) => handleInputChange('mensaje', e.target.value)}
                className={`border ${errors.mensaje ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 min-h-[100px] w-full`}
              />
              {errors.mensaje && <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>}
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="privacy" 
                checked={formData.aceptacion_privacidad}
                onChange={(e) => handleInputChange('aceptacion_privacidad', e.target.checked)}
                className="mr-2 mt-1" 
              />
              <label htmlFor="privacy" className="text-sm text-gray-700">
                He leído y acepto el aviso de privacidad
              </label>
            </div>
            {errors.aceptacion_privacidad && <p className="text-red-500 text-sm mt-1">{errors.aceptacion_privacidad}</p>}

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="comunicacion" 
                checked={formData.aceptacion_comunicacion}
                onChange={(e) => handleInputChange('aceptacion_comunicacion', e.target.checked)}
                className="mr-2 mt-1" 
              />
              <label htmlFor="comunicacion" className="text-sm text-gray-700">
                Acepto recibir comunicación de parte de ASONIPED
              </label>
            </div>
            {errors.aceptacion_comunicacion && <p className="text-red-500 text-sm mt-1">{errors.aceptacion_comunicacion}</p>}

            {/* Mensaje de estado */}
            {submitStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {submitMessage}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white font-semibold py-2 px-6 rounded transition self-start`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default DonacionesVisual;
