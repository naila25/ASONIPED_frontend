import UserTicketsList from "../../Components/Donation/UserTicketsList";
import { useAuth } from "../../Utils/useAuth";

export default function MensajesPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto">
      {user && <UserTicketsList userId={user.id} />}
    </div>
  );
}

