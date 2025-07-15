import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="from-foreground/50 to-primary flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-b">
        <Card className="max-w-lg min-w-[35%]">
          <CardHeader className="sr-only p-0">
            <CardDescription>Authentication pages</CardDescription>
          </CardHeader>

          <CardContent>
            <ScrollArea className="max-h-[80%]">{children}</ScrollArea>
          </CardContent>
        </Card>
      </div>
  );
}
