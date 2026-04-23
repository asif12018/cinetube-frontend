"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
// import { sendOtpAction } from "@/actions/authActions"; // Your actual API call
// import { emailOnlyZodSchema } from "@/schemas/auth"; // Your Zod schema for just the email
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendOtpAction, resendOtpForForgotPassword } from "@/service/otp.service";
import AppField from "../form/AppField";
import AppSubmitButton from "../form/AppSubmitButton";


interface RequestOtpFormProps {
  redirectPath?: string;
}

export const RequestOtpForm = ({ redirectPath }: RequestOtpFormProps) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: { email: string }) => resendOtpForForgotPassword(payload.email as string),
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);
      try {
        const result = (await mutateAsync(value)) as any;

        console.log('this is result', result);

        if (!result.success) {
          setServerError(result.message || "Failed to send OTP. Please try again.");
          return;
        }

        setSuccessMessage("OTP sent to your email! Redirecting...");
        
        // Redirect to the actual reset-password or verify-otp page
        // Passing the email in the URL so the next page knows who we are verifying
        setTimeout(() => {
          router.push(result.redirectUrl || `/reset-password?email=${encodeURIComponent(value.email)}`);
        }, 1000);

      } catch (error: any) {
        if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
          throw error;
        }
        setServerError(`Request failed: ${error.message}`);
      }
    },
  });

  return (
    <Card className="font-sans w-full max-w-[450px] mx-auto bg-black/75 sm:bg-black/80 text-white border-0 shadow-none px-4 py-8 sm:p-12 sm:pb-16 rounded-md">
      <CardHeader className="text-left px-0 pt-0">
        <CardTitle className="text-[32px] font-semibold mb-2">Forgot Password</CardTitle>
        <p className="text-[16px] text-[#737373] mb-6">
          Enter your email address and we'll send you a One-Time Password (OTP) to recover your account.
        </p>
      </CardHeader>

      <CardContent className="px-0">
        <form
          method="POST"
          action="#"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 [&_label]:sr-only [&_input]:bg-[#333] [&_input]:text-white [&_input]:border-none [&_input]:h-[48px] [&_input]:rounded-[4px] [&_input]:px-5 focus-visible:[&_input]:ring-0 focus:[&_input]:border-b-2 focus:[&_input]:border-[#e87c03]"
        >
          <form.Field
            name="email"
            // validators={{ onChange: emailOnlyZodSchema.shape.email }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                placeholder="name@example.com"
              />
            )}
          </form.Field>

          {serverError && (
            <Alert className="bg-[#e87c03] border-none text-white font-medium p-4 mt-4">
              <AlertDescription className="text-white font-semibold">{serverError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-[#1a8a3c] border border-green-400/40 text-white font-medium p-4 mt-4">
              <AlertDescription className="text-white font-semibold">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton
                  className="w-full bg-[#E50914] hover:bg-[#C11119] text-white h-[48px] font-bold text-[16px] rounded-[4px]"
                  isPending={isSubmitting || isPending}
                  pendingLabel="Sending OTP..."
                  disabled={!canSubmit}
                >
                  Send OTP
                </AppSubmitButton>
              )}
            </form.Subscribe>
          </div>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#737373]/40"></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start bg-transparent px-0 border-t-0 pt-2 space-y-4">
        <p className="text-[16px] text-[#737373]">
          Remember your password?{" "}
          <Link href="/login" className="text-white font-medium hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-xs text-[#8c8c8c]">
          This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
          <span className="text-[#0071eb] hover:underline cursor-pointer">Learn more.</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RequestOtpForm;