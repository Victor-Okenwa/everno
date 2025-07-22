import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { MonitorCogIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <Popover>
        <PopoverTrigger className="cursor-pointer border-primary from-primary to-background flex items-center gap-1 rounded-full border bg-gradient-to-tl to-50% px-3 py-2 text-sm [&>svg]:size-5 [&>svg]:text-primary max-sm:hidden">
          {theme === "dark" && (
            <>
              {" "}
              <MoonIcon /> Dark
            </>
          )}
          {theme === "light" && (
            <>
              {" "}
              <SunIcon /> Light
            </>
          )}
          {theme === "system" && (
            <>
              {" "}
              <MonitorCogIcon /> System
            </>
          )}
        </PopoverTrigger>
        <PopoverContent className="flex size-fit flex-col overflow-hidden p-0">
          <Button
            variant={"ghost"}
            className={cn("flex gap-1 rounded-none", {
              "bg-primary text-background hover:bg-primary hover:text-background": theme === "system",
            })}
            onClick={() => setTheme("system")}
          >
            <MonitorCogIcon /> System
          </Button>
          <Button
            variant={"ghost"}
            className={cn("flex gap-1 rounded-none", {
              "bg-primary text-background hover:bg-primary hover:text-background": theme === "light",
            })}
            onClick={() => setTheme("light")}
          >
            <SunIcon /> Light
          </Button>
          <Button
            variant={"ghost"}
            className={cn("flex gap-1 rounded-none", {
              "bg-primary text-background hover:bg-primary hover:text-background": theme === "dark",
            })}
            onClick={() => setTheme("dark")}
          >
            <MoonIcon /> Dark
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
