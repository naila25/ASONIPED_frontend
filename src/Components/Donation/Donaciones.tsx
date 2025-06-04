import React from 'react';
import { Link } from '@tanstack/react-router';

const Donaciones: React.FC = () => {
  return (
    <section className="py-5 my-12 px-6 text-gray-800"> {/* Espacio entre cada componente */}
        <h2 className="text-orange-700 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
           ¿Por qué ayudar a 
          <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
            {" "}
            ASONIPED?
          </span>
        </h2>
      <p className="text-neutral-500 text-xl text-center lg:text-center py-7">
        Las donaciones a ASONIPED permiten ofrecer paseos recreativos a los niños, renovar el mobiliario como pupitres
        y mantener en buen estado las instalaciones de la organización. Cada aporte suma a mejorar su calidad de vida.
      </p>

      {/* Tarjetas de inversión del dinero */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 ">
        {[
          {
            title: 'Paseos y actividades',
            description: 'Creamos experiencias recreativas para que los chicos disfruten, aprendan y creen recuerdos inolvidables fuera del aula.',
            image: 'https://centrodeinformacion.manizales.gov.co/wp-content/uploads/2021/11/Las-secretarias-de-Gobierno-y-Desarrollo-Social-realizan-actividades-ludicas-y-recreativas-dirigidas-a-mujeres-de-Manizales.jpeg',
          },
          {
            title: 'Compra de pupitres',
            description: 'Renovamos el mobiliario para garantizar que todos tengan un espacio cómodo y digno para estudiar y desarrollarse.',
            image: 'https://ofistim.com.tr/wp-content/webp-express/webp-images/uploads/2024/01/pupitres-escolares.jpeg.webp',
          },
          {
            title: 'Mantenimiento institucional',
            description: 'Contribuyes al buen funcionamiento de ASONIDEP, asegurando espacios limpios, seguros y adecuados para todos.',
            image: 'https://factorinmobiliarioedifikarq.wordpress.com/wp-content/uploads/2016/02/mantenimiento.jpg?w=820&h=312&crop=1',
          },
        ].map((item, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-6 text-center flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              </div>
              <Link
                to="/donaciones/formulario"
                className=" text-white w-full bg-gradient-to-r from-orange-400 to-orange-700 py-2 rounded hover:bg-orange-600 transition-colors hover:opacity-90">
                Quiero donar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Donaciones;