import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "primary" | "secondary" | "success" | "warning" | "info";
}

const colorStyles = {
  primary: "gradient-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color = "primary",
}: FeatureCardProps) => {
  return (
    <div className="group rounded-2xl bg-card p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110",
          colorStyles[color]
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
