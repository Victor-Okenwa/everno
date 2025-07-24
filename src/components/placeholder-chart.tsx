import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Separator } from "./ui/separator";

export function PlaceholderChart() {
  return (
    <Card className="flex-grow min-w-[35%] opacity-80">
      <CardHeader>
        <CardDescription className="text-xs">No Chart described</CardDescription>
        <Separator />
        <CardTitle className="text-lg font-semibold">
          Placeholder Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[200px]">
        <Link href="/dashboard/new" className="flex items-center justify-center size-full border-2 border-dashed bg-accent rounded-sm text-secondary-foreground/70">
        <PlusIcon /> <span>Add New Data</span>
        </Link>
      </CardContent>
    </Card>
  );
}
