import { Settings } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function PerfilPage() {
  return (
    <ModulePlaceholder
      title="Mi Perfil"
      description="Gestiona tu información personal y configuración de cuenta"
      icon={Settings}
      color="bg-gray-500"
    />
  );
}
