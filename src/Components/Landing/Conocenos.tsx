import asoniped from '../../assets/asoniped.jpg'; 
import asoniped1 from '../../assets/asoniped1.jpg'
import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { motion } from "framer-motion";

const ConocenosSection = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto relative">
      <Link 
        to="/"
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-100 transition-colors"
        aria-label="Cerrar página"
      >
        <X className="w-6 h-6 text-orange-600" />
      </Link>
     
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-16">Conócenos</h2>

      {/* Primera sección */}
      <div className="flex flex-col lg:flex-row items-center gap-10 mb-24">
        <motion.img
          src={asoniped1}
          alt="Quiénes somos"
          className="w-full lg:w-1/2 rounded-xl shadow-xl"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        />
        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-orange-600 text-2xl font-semibold mb-4"> ¿Qué es ASONIPED?</h3>
          <p className="text-neutral-700 text-lg">
            ASONIPED es una asociación sin fines de lucro que impulsa la inclusión y el desarrollo integral de personas con discapacidad en la región de Nicoya, promoviendo proyectos educativos, recreativos y sociales.
          </p>
        </motion.div>
      </div>

      {/* Segunda sección */}
      <div className="flex flex-col lg:flex-row-reverse items-center gap-10 mb-24">
        <motion.img
          src={asoniped}
          alt="A quiénes ayudamos"
          className="w-full lg:w-1/2 rounded-xl shadow-xl"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        />
        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className=" text-orange-600 text-2xl font-semibold mb-4"> ¿A Quiénes Ayudamos?</h3>
          <p className="text-neutral-700 text-lg">
            Ayudamos a niños, jóvenes y adultos con diversas condiciones de discapacidad, brindándoles acceso a educación especializada, actividades integradoras y apoyo familiar.
          </p>
        </motion.div>
      </div>

      {/* Misión y Visión */}
      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        <motion.div
          className="lg:w-1/2 text-center lg:text-left"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h4 className="text-orange-600 text-2xl font-semibold mb-2 text-center">Misión</h4>
          <p className="text-neutral-700">
            ASONIPED es una Organización No Gubernamental, sin fines de lucro, que brinda atención integral con la ayuda de nuestros colaboradores para mejorar la calidad de vida de las personas con discapacidad y sus familias, en el territorio de Nicoya, Hojancha y Nandayure.
          </p>
        </motion.div>

        <motion.div
          className="lg:w-1/2 text-center lg:text-left"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h4 className="text-orange-600 text-2xl font-semibold mb-2 text-center">Visión</h4>
          <p className="text-neutral-700">
            Ser una organización de vanguardia en temas de discapacidad en pro del desarrollo y participación integral de formación humana para nuestra población meta, que favorezca su plena inclusión como ciudadanos de pleno derecho. Siendo un modelo de nuevas prácticas e innovación tecnológica, con énfasis en el uso de tecnologías limpias.
          </p>
        </motion.div>
      </div>

      {/* Valores */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h3 className="text-orange-600 text-xl font-bold mb-2">NUESTROS VALORES</h3>
        <p className="max-w-2xl mx-auto text-neutral-700 mb-10">
          Nuestros valores que nos caracterizan y que nos ayudan a guiar nuestro camino, siempre con los pies bien puestos sobre la tierra y cerquita de la comunidad.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {['Solidaridad', 'Empatía', 'Responsabilidad Social', 'Honestidad', 'Respeto', 'Tolerancia', 'Credibilidad'].map((valor, index) => (
            <motion.div
              key={index}
              className="bg-orange-300 text-white px-6 py-3 rounded-full text-lg font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
               whileHover={{ y: -10, scale: 1.05 }} // 👈 animación al pasar el cursor
            >
              {valor}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ConocenosSection;
