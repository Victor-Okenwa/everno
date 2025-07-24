"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SlashIcon } from "lucide-react";

interface BreadcrumbItemProps {
  label: string;
  href?: string;
  isCurrent?: boolean;
  sublinks?: { label: string; href: string }[];
}

export function CustomBreadcrumbs() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter((segment) => segment);
    const items: BreadcrumbItemProps[] = [{ label: "Home", href: "/" }];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Create sublinks for intermediate levels (2nd and 3rd levels)
      // const sublinks =
      //   index < 3 && !isLast
      //     ? [
      //         { label: `${segment} Sub 1`, href: `${currentPath}` },
      //         { label: `${segment} Sub 2`, href: `${currentPath}` },
      //       ]
      //     : undefined;

      items.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        isCurrent: isLast,
        // sublinks: index < 3 ? sublinks : undefined,
      });
    });

    // Limit to 4 levels total (Home + 3 segments)
    return items.slice(0, 4);
  }, [pathname]);

  return (
    <Breadcrumb className="px-2 py-5">
      <BreadcrumbList>
        {generateBreadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <BreadcrumbSeparator />
            )}
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) /* : item.sublinks ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    <BreadcrumbLink asChild>
                      <Link href={item.href ?? "#"}>{item.label}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbEllipsis className="h-4 w-4"  />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.sublinks.map((sublink, subIndex) => (
                      <DropdownMenuItem key={subIndex}>
                        <Link href={sublink.href}>{sublink.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) */: (
                <BreadcrumbLink asChild>
                  <Link href={item.href ?? "#"}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
