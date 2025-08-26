import { MessageSquare } from "lucide-react";
import ModulePlaceholder from "./ModulePlaceholder";

export default function MensajesPage() {
  return (
    <ModulePlaceholder
      title="Mensajes"
      description="Comunícate directamente con los administradores de ASONIPED"
      icon={MessageSquare}
      color="bg-indigo-500"
    />
  );
}

