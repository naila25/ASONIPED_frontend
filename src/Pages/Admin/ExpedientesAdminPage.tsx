import { FileText } from "lucide-react";
import AdminModulePlaceholder from "../../Components/Admin/AdminModulePlaceholder";

export default function ExpedientesAdminPage() {
  return (
    <AdminModulePlaceholder
      title="Administración de Expedientes"
      description="Gestiona y revisa todos los expedientes de beneficiarios"
      icon={FileText}
      color="bg-blue-500"
    />
  );
}
