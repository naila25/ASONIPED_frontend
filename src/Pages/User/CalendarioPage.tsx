import { Calendar } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function CalendarioPage() {
  return (
    <ModulePlaceholder
      title="Calendario"
      description="Visualiza todas tus actividades y eventos programados"
      icon={Calendar}
      color="bg-teal-500"
    />
  );
}

