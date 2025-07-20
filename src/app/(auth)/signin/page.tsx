"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInputField from "~/components/form/custom-input-field";
import { Form } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { CustomLoader } from "~/components/custom-loader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { setAuthCookie } from "~/lib/auth";

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(5, { message: "Password cannot be less than 5 characters" }),
});

type SigninSchemaForm = z.infer<typeof signinSchema>;

export default function Signin() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const form = useForm<SigninSchemaForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = api.auth.login.useMutation({
    onError(error) {
      toast.error("Login error. Reason: " + error.message);
    },
    onSuccess: ({ token }) => {
      document.cookie = setAuthCookie(token);
      toast.success("Your account has been signed in");
      router.push("/dashboard");
    },
  });

  const handleSubmit = async ({ email, password }: SigninSchemaForm) => {
    login.mutate({ email, password });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl sm:text-3xl">Welcome,</h2>
        <p className="text-foreground/70 max-w-xs">
          Fill in your details below to login to your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CustomInputField
            control={form.control}
            name="email"
            placeholder="e.g johndoe@gmail.com"
          />
          <CustomInputField
            control={form.control}
            name="password"
            placeholder="********"
            isPasswordVisible={isPasswordVisible}
            setIsPasswordVisible={setIsPasswordVisible}
          />
          <Button disabled={login.isPending} className="mt-2 w-full">
            {login.isPending ? <CustomLoader type="all" /> : "Proceed"}
          </Button>
        </form>
      </Form>
      <p className="text-foreground/60 mx-auto">
        Do not have an account?{" "}
        <Link href={"/signup"} className="text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
