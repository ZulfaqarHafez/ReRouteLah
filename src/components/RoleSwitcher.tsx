import { UserRole } from "@/types/index";
import { User, Heart } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSwitcher = ({ currentRole, onRoleChange }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      <button
        onClick={() => onRoleChange("patient")}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          currentRole === "patient"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="h-4 w-4" />
        <span>Patient</span>
      </button>
      <button
        onClick={() => onRoleChange("caregiver")}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          currentRole === "caregiver"
            ? "bg-secondary text-secondary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Heart className="h-4 w-4" />
        <span>Caregiver</span>
      </button>
    </div>
  );
};

export default RoleSwitcher;
