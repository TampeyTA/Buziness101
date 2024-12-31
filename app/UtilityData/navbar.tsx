import { Home, Zap, Settings, User } from "lucide-react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link
} from "@nextui-org/react";

export default function NavigationBar() {
  return (
    <Navbar className="shadow-sm">
      <NavbarBrand>
        <Zap className="text-primary" size={24} />
        <p className="font-bold text-inherit ml-2">Energy Monitor</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link href="/" className="flex items-center gap-2">
            <Home size={18} />
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/" className="flex items-center gap-2">
            <Zap size={18} />
            Usage
          </Link>
        </NavbarItem>
      </NavbarContent>

    </Navbar>
  );
}