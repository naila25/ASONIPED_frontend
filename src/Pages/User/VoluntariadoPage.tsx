import { Heart } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function VoluntariadoPage() {
  return (
    <ModulePlaceholder
      title="Voluntariado"
      description="Participa en programas de voluntariado y registra tus horas"
      icon={Heart}
      color="bg-purple-500"
    />
  );
}
