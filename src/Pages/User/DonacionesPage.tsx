import { DollarSign } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function DonacionesPage() {
  return (
    <ModulePlaceholder
      title="Donaciones"
      description="Realiza donaciones y consulta tu historial de contribuciones"
      icon={DollarSign}
      color="bg-orange-500"
    />
  );
}
