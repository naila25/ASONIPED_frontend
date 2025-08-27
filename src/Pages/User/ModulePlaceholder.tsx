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
        </div>
      </div>
    </div>
  );
}

