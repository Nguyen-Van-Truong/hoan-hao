import { Badge } from "@/components/ui/badge";
import { GameStatus } from "@/data/games";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GameStatusBadgeProps {
  status: GameStatus;
}

export default function GameStatusBadge({ status }: GameStatusBadgeProps) {
  const { t } = useLanguage();
  const getStatusConfig = () => {
    switch (status) {
      case "playable":
        return {
          label: t("games.playable"),
          variant: "success" as const,
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          className: "bg-green-600",
        };
      case "coming_soon":
        return {
          label: t("games.comingSoon"),
          variant: "secondary" as const,
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          className: "bg-blue-500",
        };
      case "maintenance":
        return {
          label: t("games.maintenance"),
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
          className: "",
        };
      default:
        return {
          label: t("games.undefined"),
          variant: "outline" as const,
          icon: null,
          className: "",
        };
    }
  };

  const { label, icon, className } = getStatusConfig();

  return (
    <Badge
        className={`flex items-center text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </Badge>
  );
}
