"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginAction } from "@/app/(commonLayout)/(authRouteGroup)/login/_action";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppField from "../form/AppField";
import AppSubmitButton from "../form/AppSubmitButton";
import { ILoginPayload, loginZodSchema } from "@/app/zod/auth.validation";
import { createAuthClient } from "better-auth/client";
import { authClient } from "@/lib/auth-client";
interface LoginFormProps {
  redirectPath?: string;
}



const LoginForm = ({ redirectPath }: LoginFormProps) => {
  // const queryClient = useQueryClient();

  const queryClient = useQueryClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ILoginPayload) => loginAction(payload, redirectPath),
  });

  //send otp to

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);
      try {
        const result = (await mutateAsync(value)) as any;

        if (!result.success) {
          setServerError(result.message || "Login failed");
          return;
        }

        // Show success message and wait 1 second before redirecting
        setSuccessMessage(result.message || "Login successful! Redirecting...");
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setTimeout(() => {
          window.location.href = result.redirectUrl || "/";
        }, 1000);
      } catch (error: any) {
        // Let Next.js handle redirect errors instead of treating them as login failures
        if (
          error?.message === "NEXT_REDIRECT" ||
          error?.digest?.startsWith("NEXT_REDIRECT")
        ) {
          throw error;
        }
        console.log(`Login failed: ${error.message}`);
        setServerError(`Login failed: ${error.message}`);
      }
    },
  });
  return (
    <Card className="font-sans w-full max-w-[450px] mx-auto bg-black/75 sm:bg-black/80 text-foreground border-0 shadow-none px-4 py-8 sm:p-12 sm:pb-16 rounded-md">
      <CardHeader className="text-left px-0 pt-0">
        <CardTitle className="text-[32px] font-semibold mb-6">
          Sign In
        </CardTitle>
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
          className="space-y-4 [&_label]:sr-only [&_input]:bg-[#333] [&_input]:text-foreground [&_input]:border-none [&_input]:h-[48px] [&_input]:rounded-[4px] [&_input]:px-5 focus-visible:[&_input]:ring-0 focus:[&_input]:border-b-2 focus:[&_input]:border-[#e87c03]"
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
                    className="text-muted-foreground hover:text-foreground hover:bg-transparent"
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
            <Alert className="bg-[#e87c03] border-none text-foreground font-medium p-4 mt-4">
              <AlertDescription className="text-foreground font-semibold">
                {serverError}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-[#1a8a3c] border border-green-400/40 text-foreground font-medium p-4 mt-4">
              <AlertDescription className="text-foreground font-semibold">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton
                  className="w-full bg-[#E50914] hover:bg-[#C11119] text-foreground h-[48px] font-bold text-[16px] rounded-[4px]"
                  isPending={isSubmitting || isPending}
                  pendingLabel="Signing In...."
                  disabled={!canSubmit}
                >
                  Sign In
                </AppSubmitButton>
              )}
            </form.Subscribe>

            {/* Demo Login Button */}
            <Button
              type="button"
              disabled={isDemoLoading || isPending}
              onClick={async () => {
                setIsDemoLoading(true);
                setServerError(null);
                setSuccessMessage(null);
                try {
                  const result = (await mutateAsync({
                    email: "demo@user.com",
                    password: "demo@user.com",
                  })) as any;

                  if (!result.success) {
                    setServerError(result.message || "Demo login failed");
                    return;
                  }

                  setSuccessMessage("Demo login successful! Redirecting...");
                  queryClient.invalidateQueries({ queryKey: ["user"] });
                  setTimeout(() => {
                    window.location.href = result.redirectUrl || "/";
                  }, 1000);
                } catch (error: any) {
                  if (
                    error?.message === "NEXT_REDIRECT" ||
                    error?.digest?.startsWith("NEXT_REDIRECT")
                  ) {
                    throw error;
                  }
                  setServerError(`Demo login failed: ${error.message}`);
                } finally {
                  setIsDemoLoading(false);
                }
              }}
              className="w-full h-[48px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-[16px] rounded-[4px] flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/20"
            >
              {isDemoLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in as Demo...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Demo Login
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 bg-[#333] border-none rounded-sm accent-[#737373]"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#737373] !not-sr-only"
              >
                Remember me
              </label>
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
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black/75 sm:bg-black/80 text-[#737373]">
              OR
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* <Button
            type="button"
            variant="outline"
            className="w-full h-[48px] bg-transparent border-[#737373] text-foreground hover:bg-white/10 font-medium flex items-center justify-center gap-3"
            onClick={() => {
              window.location.href = "/api/auth/google-start";
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button> */}
          <Button
            // type="button"
            // variant="outline"
            // className="w-full h-[48px] bg-transparent border-[#737373] text-foreground hover:bg-white/10 font-medium flex items-center justify-center gap-3"
            // onClick={async (e) => {
            //   e.preventDefault();

            //   // 1. Open an empty popup IMMEDIATELY to bypass the browser's popup blocker
            //   const width = 500;
            //   const height = 600;
            //   const left = window.screenX + (window.outerWidth - width) / 2;
            //   const top = window.screenY + (window.outerHeight - height) / 2;
            //   const popup = window.open(
            //     "", // Start empty
            //     "GoogleLoginPopup",
            //     `width=${width},height=${height},left=${left},top=${top},popup=yes`
            //   );

            //   try {
            //     const backendUrl =
            //       process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || 
            //       "https://cinehub-backend-z65f.onrender.com";

            //     // 2. Fetch directly from your live Render backend
            //     const response = await fetch(
            //       `${backendUrl}/api/v1/auth/sign-in/social`,
            //       {
            //         method: "POST",
            //         headers: { "Content-Type": "application/json" },
            //         credentials: "include", // Saves the cross-domain cookie
            //         body: JSON.stringify({
            //           provider: "google",
            //           callbackURL: "http://localhost:3000",
            //         }),
            //       }
            //     );

            //     const data = await response.json();

            //     // 3. Send the popup window to the Google URL
            //     if (data?.url && popup) {
            //       popup.location.href = data.url;
            //     } else {
            //       console.error("Google start failed:", data);
            //       if (popup) popup.close(); // Close the blank popup if it failed
            //     }
            //   } catch (error) {
            //     console.error("Fetch error:", error);
            //     if (popup) popup.close(); // Close the blank popup if it failed
            //   }
            // }}
             type="button"
  variant="outline"
  className="w-full h-[48px] bg-transparent border-[#737373] text-foreground hover:bg-white/10 font-medium flex items-center justify-center gap-3"
  onClick={() => {
    // Redirect directly to the custom backend Google login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://cinehub-backend-z65f.onrender.com/api/v1"}/auth/login/google`;
  }}
          >
            {/* Putting the Icon and Text back inside the button! */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start bg-transparent px-0 border-t-0 pt-8 space-y-4">
        <p className="text-[16px] text-[#737373]">
          Forget the password?{" "}
          <Link
            href="/sendOtpVerification"
            className="text-foreground font-medium hover:underline"
          >
            Reset password
          </Link>
        </p>
        <p className="text-[16px] text-[#737373]">
          New to CineTube?{" "}
          <Link
            href="/register"
            className="text-foreground font-medium hover:underline"
          >
            Sign up now.
          </Link>
        </p>
        <p className="text-xs text-[#8c8c8c]">
          This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
          <span className="text-[#0071eb] hover:underline cursor-pointer">
            Learn more.
          </span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
