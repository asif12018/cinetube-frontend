"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginAction } from "@/app/(commonLayout)/(authRouteGroup)/login/_action";


import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppField from "../form/AppField";
import AppSubmitButton from "../form/AppSubmitButton";
import { ILoginPayload, loginZodSchema } from "@/app/zod/auth.validation";

interface LoginFormProps {
    redirectPath ?: string;
}

const LoginForm = ({ redirectPath }: LoginFormProps) => {
    // const queryClient = useQueryClient();
    
    const queryClient = useQueryClient();
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync , isPending} = useMutation({
        mutationFn : (payload : ILoginPayload) => loginAction(payload, redirectPath),
    });

    //send otp to

    const form = useForm({
        defaultValues : {
            email : "",
            password : "",
        },

        onSubmit : async ({value}) => {
            setServerError(null);
            setSuccessMessage(null);
            try {
                const result = await mutateAsync(value) as any;

                if(!result.success ){
                    setServerError(result.message || "Login failed");
                    return ;
                }

                // Show success message and wait 1 second before redirecting
                setSuccessMessage(result.message || "Login successful! Redirecting...");
                queryClient.invalidateQueries({ queryKey: ["user"] });
                setTimeout(() => {
                    window.location.href = result.redirectUrl || "/";
                }, 1000);
            } catch (error : any) {
                // Let Next.js handle redirect errors instead of treating them as login failures
                if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
                    throw error;
                }
                console.log(`Login failed: ${error.message}`);
                setServerError(`Login failed: ${error.message}`);
            }
        }
    })
  return (
    <Card className="font-sans w-full max-w-[450px] mx-auto bg-black/75 sm:bg-black/80 text-white border-0 shadow-none px-4 py-8 sm:p-12 sm:pb-16 rounded-md">
      <CardHeader className="text-left px-0 pt-0">
        <CardTitle className="text-[32px] font-semibold mb-6">Sign In</CardTitle>
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
            validators={{ onChange: loginZodSchema.shape.email }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                placeholder="Email or phone number"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: loginZodSchema.shape.password }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer mt-4"
                append={
                  <Button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-5" aria-hidden="true" />
                    )}
                  </Button>
                }
              />
            )}
          </form.Field>

          {serverError && (
            <Alert variant={"destructive"} className="bg-[#e87c03] border-none text-white font-medium p-4 mt-4">
              <AlertDescription className="text-white">{serverError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-[#1a8a3c] border border-green-400/40 text-white font-medium p-4 mt-4">
              <AlertDescription className="text-white font-semibold">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton className="w-full bg-[#E50914] hover:bg-[#C11119] text-white h-[48px] font-bold text-[16px] rounded-[4px]" isPending={isSubmitting || isPending} pendingLabel="Signing In...." disabled={!canSubmit}>
                  Sign In
                </AppSubmitButton>
              )}
            </form.Subscribe>
          </div>

         

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="h-4 w-4 bg-[#333] border-none rounded-sm accent-[#737373]" />
              <label htmlFor="remember" className="text-sm text-[#737373] !not-sr-only">Remember me</label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-[#737373] hover:underline"
            >
              Need help?
            </Link>
          </div>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#737373]/40"></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start bg-transparent px-0 border-t-0 pt-8 space-y-4">
        <p className="text-[16px] text-[#737373]">
            Forget the password?{" "}
            <Link href="/sendOtpVerification" className="text-white font-medium hover:underline">Reset password</Link>
        </p>
        <p className="text-[16px] text-[#737373]">
            New to CineHub?{" "}
            <Link
                href="/register"
                className="text-white font-medium hover:underline"
            >
                Sign up now.
            </Link>
        </p>
        <p className="text-xs text-[#8c8c8c]">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
            <span className="text-[#0071eb] hover:underline cursor-pointer">Learn more.</span>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginForm