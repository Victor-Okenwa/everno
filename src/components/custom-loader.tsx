import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

declare interface LoaderProps {
  className?: string;
  type: "text" | "loader" | "all";
  size?: number;
}

export const CustomLoader = ({
  className = "",
  type,
  size = 20,
}: LoaderProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(type === "all" || type === "loader") && (
        <Loader2 size={size} className="animate-spin" />
      )}
      {(type === "all" || type === "text") && (
        <span className="font-montserrat animate-pulse">Loading...</span>
      )}
    </div>
  );
};
