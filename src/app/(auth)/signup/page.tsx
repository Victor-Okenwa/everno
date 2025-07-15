"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInputField from "~/components/form/custom-input-field";
import { Form } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { CustomLoader } from "~/components/custom-loader";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { setAuthCookie } from "~/lib/auth";
// import { useAuth } from "~/app/_providers/auth-provider";

const signinSchema = z.object({
  name: z.string({ message: "Field is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(5, { message: "Password cannot be less than 5 characters" }),
});

type SigninSchemaForm = z.infer<typeof signinSchema>;

export default function SignUp() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const register = api.auth.register.useMutation({
    onError(error) {
      toast.error("Registration error. Reason: " + error.message);
    },
    onSuccess: ({ token, user }) => {
      toast.info("An otp has been sent to your email");
      document.cookie = setAuthCookie(token);
      localStorage.setItem(
        "navigationData",
        JSON.stringify({ name: user.name, email: user.email }),
      ); // Store data
      // setUser(user);
      router.push("/verify-request");
    },
  });

  const form = useForm<SigninSchemaForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: SigninSchemaForm) => {
    register.mutate(values);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl sm:text-3xl">Welcome,</h2>
        <p className="text-foreground/70 max-w-xs">
          Fill in your details below to register to your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CustomInputField
            control={form.control}
            name="name"
            placeholder="John Doe"
          />
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
          <Button disabled={register.isPending} className="mt-2 px-6">
            {register.isPending ? <CustomLoader type="all" /> : "Proceed"}
          </Button>
        </form>
      </Form>
      <p className="text-foreground/60 mx-auto">
        Already have an account?{" "}
        <Link href={"/signin"} className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
