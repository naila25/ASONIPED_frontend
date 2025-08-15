import { motion } from "framer-motion";
import { FaMoneyBillWave, FaGift, FaMobileAlt, FaUniversity } from "react-icons/fa";
import quienessomos from "../../assets/quienessomos.png"

const DonacionesVisual = () => {
  return (
    <section className="min-h-screen bg-white px-6 py-10 flex flex-col items-center">
      {/* Título principal */}
      <motion.h2
        className="text-4xl font-bold text-orange-700 mb-4 text-center"
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
        className="text-3xl font-bold text-orange-700 mb-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        Formas de donación
      </motion.h3>

      <div className="flex flex-col gap-12 w-full max-w-6xl">
        {/* Donación Económica */}
        <motion.div
          className="flex flex-col md:flex-row items-center bg-white border rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <FaMoneyBillWave className="text-orange-600 text-2xl mr-3" />
              <h4 className="text-xl font-bold text-orange-700">Donación Económica</h4>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FaMobileAlt className="text-orange-500 mr-2" /> Sinpe Móvil:
            </p>
            <p className="text-orange-600 font-medium mb-3 ml-6">8888-8888</p>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FaUniversity className="text-orange-500 mr-2" /> Cuenta Bancaria:
            </p>
            <p className="text-orange-600 font-medium ml-6">IBAN: CR05000123456789123456</p>
          </div>

          <div className="w-full md:w-1/2 h-full p-4">
            <img
              src={quienessomos}
              alt="quienessomos"
              className="object-cover w-full h-full rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Donación en Especie */}
        <motion.div
          className="flex flex-col md:flex-row-reverse items-center bg-white border rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, x: -100 }} 
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <FaGift className="text-orange-600 text-2xl mr-3" />
              <h4 className="text-xl font-bold text-orange-700">Donación en Especie</h4>
            </div>
            <p className="text-gray-700">
              Puedes donar alimentos, ropa, víveres y otros artículos útiles. Contáctanos para coordinar la entrega en nuestras oficinas.
            </p>
          </div>

          <div className="w-full md:w-1/2 h-full p-4">
            <img
              src={quienessomos}
              alt="quienessomos"
              className="object-cover w-full h-full rounded-2xl"
            />
          </div>
        </motion.div>
      </div>

      {/* FORMULARIO EN TARJETA */}
      <motion.div
        className="w-full max-w-6xl bg-white border border-gray-200 rounded-xl shadow-xl p-10 mb-12 mt-16"
        initial={{ opacity: 0, y: 100 }} 
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-start">
          {/* Información de contacto */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-orange-700 mb-4">Recibe información sobre ASONIPED</h3>
            <p className="text-gray-700 mb-4">
              ¿Tienes preguntas o deseas colaborar? ¡Contáctanos!
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Teléfono:</strong>{" "}
              <a href="tel:+50664236461" className="text-orange-600">(506) 64 23 64 61</a>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Correo:</strong>{" "}
              <a href="mailto:asoniped@gmail.com" className="text-orange-600">asoniped@gmail.com</a>
            </p>
          </div>

          {/* Formulario */}
          <form className="text-black grid grid-cols-1 gap-4">
            <p className="text-gray-700">Déjanos tu mensaje</p>
            <input
              type="text"
              placeholder="Nombre"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Asunto"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <textarea
              placeholder="Mensaje"
              className="border border-gray-300 rounded px-4 py-2 min-h-[100px]"
            />

            <div className="flex items-start">
              <input type="checkbox" id="privacy" className="mr-2 mt-1" />
              <label htmlFor="privacy" className="text-sm text-gray-700">
                He leído y acepto el aviso de privacidad
              </label>
            </div>

            <div className="flex items-start">
              <input type="checkbox" id="comunicacion" className="mr-2 mt-1" />
              <label htmlFor="comunicacion" className="text-sm text-gray-700">
                Acepto recibir comunicación de parte de ASONIPED
              </label>
            </div>

            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded transition self-start"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default DonacionesVisual;
