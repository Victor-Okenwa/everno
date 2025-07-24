"use client";
import {
  Calendar,
  Home,
  Inbox,
  Link2Icon,
  PlugZap2,
  PlusCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import CustomInputField from "../form/custom-input-field";
import { api } from "~/trpc/react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { CustomLoader } from "../custom-loader";

const newLinkFormSchema = z.object({
  name: z
    .string({ message: "Field cannot be empty" })
    .min(4, { message: "Link must be at least 4 characters" }),
});
type NewLinkForm = z.infer<typeof newLinkFormSchema>;

function NavProjectsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <SidebarMenuSubItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuSubItem>
      ))}
    </>
  );
}

export function AppSidebar() {
  // const {reload} = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const getAllLinks = api.userCall.getAllLinks.useQuery();

  const newLinkForm = useForm<NewLinkForm>({
    resolver: zodResolver(newLinkFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const newLinkMutation = api.userCall.createLink.useMutation({
    onError: (error) => {
      toast.error("Failed to create link " + error.message);
    },
    onSuccess: async () => {
      toast.success("New Link added");
      setOpen(false);
      newLinkForm.reset();
      await getAllLinks.refetch();
    },
  });
  async function handleSubmit({ name }: NewLinkForm) {
    try {
      await newLinkMutation.mutateAsync({ name });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  className="data-[active=true]:bg-primary data-[active=true]:[&>svg]:text-secondary/80 data-[active=true]:text-background py-5 [&>svg]:size-5"
                >
                  <Link href={"/dashboard"}>
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuSubButton>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === "/dashboard/new"}
                  className="data-[active=true]:bg-primary data-[active=true]:[&>svg]:text-secondary/80 data-[active=true]:text-background py-5 [&>svg]:size-5"
                >
                  <Link href={"/dashboard/new"}>
                    <PlugZap2 />
                    <span>New Data</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Custom Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSub>
              <Suspense fallback={<NavProjectsSkeleton />}>
                {getAllLinks.isLoading ? (
                  <NavProjectsSkeleton />
                ) : (
                  getAllLinks.data?.links.map(({ name }) => (
                    <SidebarMenuSubItem key={name}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === `/dashboard/group/${name}`}
                        className="data-[active=true]:bg-primary data-[active=true]:[&>svg]:text-secondary/80 data-[active=true]:text-background py-5 [&>svg]:size-5"
                      >
                        <Link href={`/dashboard/group/${name}`}>
                          <Link2Icon />
                          <span className="capitalize">{name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </Suspense>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant={"outline"}>
                    <PlusCircleIcon /> Add new link
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Link</DialogTitle>
                    <DialogDescription>
                      You can group your dashboards in to segments for easy
                      navigation and relation.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...newLinkForm}>
                    <form onSubmit={newLinkForm.handleSubmit(handleSubmit)}>
                      <CustomInputField
                        control={newLinkForm.control}
                        name="name"
                        label="Name"
                        placeholder="Name of group eg.budget"
                        inputClassName="lowercase"
                      />
                      <DialogFooter>
                        <Button
                          className="px-16"
                          disabled={newLinkMutation.isPending}
                        >
                          {newLinkMutation.isPending ? (
                            <CustomLoader type="all" />
                          ) : (
                            "Create"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </SidebarMenuSub>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
