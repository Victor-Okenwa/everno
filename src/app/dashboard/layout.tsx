import React from "react";
import { AppSidebar } from "~/components/navigation/app-sidebar";
import { AppTopBar } from "~/components/navigation/app-top-bar";
import { CustomBreadcrumbs } from "~/components/navigation/custom-breadcrumbs";
import { SidebarProvider } from "~/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <AppTopBar />
        <CustomBreadcrumbs />
        {children}
      </main>
    </SidebarProvider>
  );
}
