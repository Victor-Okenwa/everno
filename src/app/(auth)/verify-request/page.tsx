"use client";

import { InfoIcon } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { motion } from "motion/react";
import { CustomLoader } from "~/components/custom-loader";
import {CustomOtpField} from "~/components/form/custom-otp-field";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "~/components/ui/form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { setAuthCookie } from "~/lib/auth";

const verifyOtpSchema = z.object({
  otp: z.string().min(4, "Otp must be 4 digits"),
});

type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export default function VerifyRequest() {
  const [state, setState] = useState<{ name: string; email: string } | null>(
    null,
  );

  const router = useRouter();
  const mutation = api.auth.verifyOtp.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: ({ token }) => {
      document.cookie = setAuthCookie(token);
      setAuthCookie(token);
      toast.success("OTP verified successfully!");
      router.push("/dashboard");
    },
  });

  const resendMutation = api.auth.resendOtp.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("OTP han been resent successfully!");
    },
  });

  const verifyOtpForm = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleVerifyOtp = ({ otp }: VerifyOtpSchema) => {
    setTimeout(() => {
      mutation.mutate({ email: state!.email, otp });
    }, 1500);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("navigationData");
    if (!storedData || storedData === "null") {
      router.push("/signup");
    }
    setState(JSON.parse(storedData!) as { name: string; email: string });

    setTimeout(() => {
      localStorage.removeItem("navigationData"); // Clean up
    }, 3000);
  }, [router]);

  return (
    <Suspense fallback={<CustomLoader type="all" className="size-10" />}>
      <div>
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ rotateY: 270, perspective: 290, scale: 1.2 }}
            animate={{
              rotateY: [270, 450, 0],
              perspective: 30,
              scale: 1,
              transition: { times: [0, 0.3, 1], ease: "circInOut" },
            }}
            exit={{ rotateY: 270, perspective: 2 }}
            transition={{
              visualDuration: 400.2,
              delay: 300,
              type: "keyframes",
              stiffness: 100,
              damping: 20,
            }}
          >
            <InfoIcon className="text-primary size-20" />
          </motion.div>

          <h2 className="text-primary text-center text-lg font-semibold">
            Confirm Your email
          </h2>
          <p className="max-w-md text-center text-sm">
            An Otp has been sent to your email address. Please check your inbox
            and enter the Otp to verify your email address.
          </p>
        </div>
        <Form {...verifyOtpForm}>
          <form onSubmit={verifyOtpForm.handleSubmit(handleVerifyOtp)}>
            <div className="mx-auto my-2 max-w-xs">
              <CustomOtpField
                control={verifyOtpForm.control}
                name="otp"
                isNotLabeled
                isLoading={mutation.isPending}
                // handleSubmit={handleVerifyOtp}
              />
              <Button
                disabled={mutation.isPending}
                className="mt-5 w-full max-w-sm"
              >
                {mutation.isPending ? (
                  <CustomLoader type="all" />
                ) : (
                  "Verify Otp"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="flex">
          <Button
            variant={"ghost"}
            className="text-primary px-none ml-auto size-fit text-sm"
            disabled={resendMutation.isPending}
            onClick={() => {
              resendMutation.mutate({ email: state!.email });
            }}
          >
            Resend OTP
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
