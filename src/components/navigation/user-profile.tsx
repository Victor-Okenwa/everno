import { useAuth } from "~/app/_providers/auth-provider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { LogOutIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

export default function UserProfile() {
  const { user, logout } = useAuth();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-foreground text-background uppercase">
              <Suspense fallback={<Skeleton className="bg-red-500 size-full" />}>{user?.name.charAt(0)}</Suspense>
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="size- mb-0 flex flex-col overflow-hidden px-0 py-0 pb-0"
        >
          <Button asChild variant="secondary">
            <Link href="/settings" className="flex gap-1 rounded-none">
              <Settings2Icon /> Settings
            </Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"destructive"}
                className="flex gap-1 rounded-none"
              >
                <LogOutIcon /> Logout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"secondary"}>No</Button>
                </DialogClose>
                <Button variant={"destructive"} onClick={logout}>
                  Yes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
