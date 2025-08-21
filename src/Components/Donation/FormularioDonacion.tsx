import { motion } from "framer-motion";
import { FaMoneyBillWave, FaGift, FaMobileAlt, FaUniversity } from "react-icons/fa";
import quienessomos from "../../assets/quienessomos.png"
import manoscoloridas from "../../assets/profile-pictures/manoscoloridas.png"
const DonacionesVisual = () => {
  return (
    <section className="min-h-screen bg-white px-6 py-10 flex flex-col items-center gap-3">
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
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded transition self-start"
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
