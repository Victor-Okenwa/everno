"use client";

import type { ClassValue } from "class-variance-authority/types";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { cn, splitCamelCaseToWords } from "~/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { CustomLoader } from "../custom-loader";

interface CustomOtpFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  isNotLabeled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  defaultValue?: never;
  value?: number;
  disabled?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  fieldClassName?: ClassValue;
  labelClassName?: ClassValue;
  isLoading?: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  // Optional handleSubmit function to be called when the OTP input is complete
  handleSubmit?: (data: T) => void;
}

export function CustomOtpField<T extends FieldValues>({
  control,
  name,
  label = "",
  isNotLabeled = false,
  inputMode = "numeric",
  defaultValue,
  value,
  disabled = false,
  hidden = false,
  readOnly = false,
  fieldClassName = "",
  labelClassName = "",
  isLoading = false,
  handleSubmit,
}: CustomOtpFieldProps<T>) {
  const [input, setInput] = useState({ length: 0, value: "" });

  useEffect(() => {
    if (input.value.length === 4) {
      // Trigger the handleSubmit function if provided
      if (typeof handleSubmit === "function") {
        handleSubmit({ [name]: input.value } as T);
      }
    }
  }, [input, handleSubmit, name]);

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      disabled={isLoading ?? disabled}
      render={({ field }) => (
        <FormItem
          className={cn("space-y-[0.2px]", fieldClassName)}
          hidden={hidden}
        >
          {!isNotLabeled && (
            <FormLabel
              className={cn(
                "text-accent-foreground/80 text-sm font-medium capitalize",
                labelClassName,
              )}
            >
              {label ?? splitCamelCaseToWords(name)}
            </FormLabel>
          )}
          <div className="relative">
            <FormControl>
              <InputOTP
                pattern={REGEXP_ONLY_DIGITS}
                maxLength={4}
                {...field}
                readOnly={readOnly}
                disabled={disabled}
                value={value ? String(value) : field.value}
                inputMode={inputMode}
                className="relative flex w-full justify-center"
                containerClassName="w-full"
                onInput={(e) => {
                  setInput({
                    length: e.currentTarget.value.length,
                    value: e.currentTarget.value,
                  });
                }}
              >
                {isLoading && (
                  <CustomLoader
                    type="loader"
                    className="absolute left-[45%] z-[3]"
                  />
                )}

                <InputOTPGroup className="flex w-full justify-between gap-[5px] ring-0 *:flex-grow *:rounded-xl *:py-8 data-[active=true]:ring-[0px]">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      // Conditionally apply the border class
                      className={cn({
                        "ring-primary ring-2": input.length > index,
                      })}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
          </div>
          <FormMessage className={cn("text-destructive text-sm")} />
        </FormItem>
      )}
    />
  );
}
