"use client";
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Button } from "../ui/button";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { ThemeSelector } from "./theme-selector";
import UserProfile from "./user-profile";

const searchSchema = z.object({
  search: z
    .string()
    .min(2, { message: "search cannot be less than 2 characters" }),
});

type SearchSchemaForm = z.infer<typeof searchSchema>;

export function AppTopBar() {
  const searchForm = useForm<SearchSchemaForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  function handleSearch(values: SearchSchemaForm) {
    console.log(values);
  }

  function onInvalidSearch(errors: typeof searchForm.formState.errors) {
    console.log(errors);
  }
  return (
    <header className="bg-background/80 border-secondary z-30 sticky top-0 flex w-full items-center justify-between border-b p-2 backdrop-blur-sm">
      <SidebarTrigger />

      <Form {...searchForm}>
        <form
          onSubmit={searchForm.handleSubmit(handleSearch, onInvalidSearch)}
          className="flex w-full max-w-lg flex-grow"
        >
          <FormField
            control={searchForm.control}
            name="search"
            render={({ field }) => (
              <FormItem className="relative mx-auto w-full">
                <FormControl>
                  <Input
                    className="w-full rounded-s-full rounded-e-none pr-[38px] focus-visible:ring-0"
                    placeholder=" Search your contents..."
                    {...field}
                  />
                </FormControl>
                {searchForm.getValues("search").length > 0 && (
                  <Button
                    variant={"ghost"}
                    type="button"
                    size={"icon"}
                    className="absolute right-0"
                    onClick={() => searchForm.reset()}
                  >
                    <X />
                  </Button>
                )}
              </FormItem>
            )}
          />
          <Button
            className="rounded-s-none rounded-e-full drop-shadow-2xl"
            aria-label="search"
          >
            <Search />
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-1">
        <ThemeSelector />
        <UserProfile />
      </div>
    </header>
  );
}
