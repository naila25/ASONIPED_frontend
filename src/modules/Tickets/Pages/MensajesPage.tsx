import UserTicketsList from "../Components/UserTicketsList";
import { useAuth } from "../../Login/Hooks/useAuth";

export default function MensajesPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto">
      {user && <UserTicketsList userId={user.id} />}
    </div>
  );
}

