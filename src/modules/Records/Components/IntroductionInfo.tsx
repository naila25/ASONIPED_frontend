import React from 'react';
import { Heart, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react';

interface IntroductionInfoProps {
  onStartProcess: () => void;
}

const IntroductionInfo: React.FC<IntroductionInfoProps> = ({ onStartProcess }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <Heart className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a ASONIPED</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Asociación Nicoyana de Personas con Discapacidad
        </p>
      </div>

      {/* ¿Qué es ASONIPED? */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            ¿Qué es ASONIPED?
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>ASONIPED</strong> es una organización sin fines de lucro dedicada a mejorar la calidad de vida 
              de las personas con discapacidad en Nicoya y alrededores. Nuestra misión es promover la inclusión, 
              igualdad de oportunidades y el respeto a los derechos humanos de todas las personas.
            </p>
            <p>
              Trabajamos para crear una sociedad más inclusiva donde las personas con discapacidad 
              puedan desarrollar su potencial pleno y participar activamente en todos los aspectos de la vida.
            </p>
          </div>
        </div>

        {/* ¿Por qué crear un expediente? */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            ¿Como registrarse en ASONIPED?
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Crear un expediente en ASONIPED es el primer paso para acceder a nuestros servicios y programas. 
              Este proceso nos permite:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Conocer sus necesidades específicas y ofrecer servicios personalizados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Conectarle con recursos y servicios especializados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Mantener un registro actualizado para mejor atención</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Participar en talleres, eventos y actividades de la asociación</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Proceso de registro */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-purple-600" />
            Proceso de Registro
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900">Registro Inicial</h3>
              <p className="text-sm text-gray-600">
                Complete sus datos personales básicos y información de contacto
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-yellow-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900">Revisión</h3>
              <p className="text-sm text-gray-600">
                Nuestro equipo revisará su solicitud y se pondrá en contacto con usted
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900">Formulario Completo</h3>
              <p className="text-sm text-gray-600">
                Complete el expediente completo con documentos y información detallada
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-cyan-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900">Revision final</h3>
              <p className="text-sm text-gray-600">
                El expediente sera revisado por nuestro equipo y se le notificara el resultado
              </p>
            </div>
          </div>
        </div>

        {/* Servicios disponibles */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Servicios Disponibles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Programas de Apoyo</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Programas de apoyo</li>
                <li>• Apoyo psicológico</li>
                <li>• Orientación</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Actividades y Talleres</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Talleres de habilidades</li>
                <li>• Actividades recreativas</li>
                <li>• Grupos de apoyo</li>
                <li>• Eventos comunitarios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            ¿Está listo para comenzar su proceso de registro en ASONIPED?
          </p>
        </div>
        <button
          onClick={onStartProcess}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          Comenzar Registro
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-sm text-gray-500">
          El proceso es gratuito y confidencial. Toda la información será tratada con el máximo respeto y privacidad.
        </p>
      </div>
    </div>
  );
};

export default IntroductionInfo;
