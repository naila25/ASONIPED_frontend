import UserTicketsList from "../Components/UserTicketsList";
import { useAuth } from "../../Login/Hooks/useAuth";

export default function MensajesPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-8xl mx-auto px-6 py-10">
      {user && <UserTicketsList userId={user.id} />}
    </div>
  );
}

