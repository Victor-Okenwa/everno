import { useAuth } from "~/app/_providers/auth-provider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";

export default function UserProfile() {
  const { user } = useAuth();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-foreground text-background">
              {user?.name.charAt(0) ?? "u"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex size-fit flex-col px-0">
          <Button asChild variant="secondary">
            <Link href="/settings" className="flex gap-1">
              <Settings2Icon /> Settings
            </Link>
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
