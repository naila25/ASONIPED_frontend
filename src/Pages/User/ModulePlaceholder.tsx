import { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function ModulePlaceholder({ title, description, icon: Icon, color }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-12">
        <div className="text-center">
          <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {title} - En Desarrollo
          </h2>
          <p className="text-gray-500 mb-6">
            Este módulo está siendo desarrollado. Pronto podrás:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Ver información</p>
              <p className="text-xs text-gray-500">Acceder a datos relevantes</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Gestionar contenido</p>
              <p className="text-xs text-gray-500">Crear y editar elementos</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-sm font-bold">3</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Seguimiento</p>
              <p className="text-xs text-gray-500">Monitorear progreso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

