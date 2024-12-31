import LogoutButton from "@/components/LogoutButton";
import { title} from "@/components/primitives";

export default function Logout() {
  return (
    <div>
      <h1 className={title()}>Log Out</h1>
      <LogoutButton />
    </div>
  );
}