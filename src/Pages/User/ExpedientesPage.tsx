import { FileText } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function ExpedientesPage() {
  return (
    <ModulePlaceholder
      title="Expedientes"
      description="Gestiona tus expedientes y documentos personales"
      icon={FileText}
      color="bg-blue-500"
    />
  );
}
