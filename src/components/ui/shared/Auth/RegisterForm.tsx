"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppField from "../form/AppField";
import AppSubmitButton from "../form/AppSubmitButton";
import { registerZodSchema } from "@/app/zod/auth.validation";
import { registerAction } from "@/app/(commonLayout)/(authRouteGroup)/register/_action";
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";
import { Input } from "../../input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";

interface RegisterFormProps {
  redirectPath?: string;
}

const RegisterForm = ({ redirectPath }: RegisterFormProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. UPDATED: mutationFn now accepts FormData
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (formData: FormData) =>
      registerAction(formData, redirectPath),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "",
      image: undefined as File | undefined,
    },

    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);
      try {
        // 2. UPDATED: Pack the values into FormData
        const formData = new FormData();
        formData.append("name", value.name);
        formData.append("email", value.email);
        formData.append("password", value.password);
        formData.append("gender", value.gender);
        
        // Only append the image if the user actually selected one
        if (value.image) {
          formData.append("image", value.image);
        }

        // 3. UPDATED: Send the formData to mutateAsync
        const result = (await mutateAsync(formData)) as any;

        if (!result.success) {
          setServerError(result.message || "Registration failed");
          return;
        }

        // Show success message and wait 1 second before redirecting
        setSuccessMessage(result.message || "Registration successful! Redirecting...");
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setTimeout(() => {
          router.push(result.redirectUrl || "/");
        }, 1000);
      } catch (error: any) {
        // Let Next.js handle redirect errors instead of treating them as login failures
        if (
          error?.message === "NEXT_REDIRECT" ||
          error?.digest?.startsWith("NEXT_REDIRECT")
        ) {
          throw error;
        }
        console.log(`Registration failed: ${error.message}`);
        setServerError(`Registration failed: ${error.message}`);
      }
    },
  });

  return (
    <Card className="font-sans w-full max-w-[450px] mx-auto bg-black/75 sm:bg-black/80 text-white border-0 shadow-none px-4 py-8 sm:p-12 sm:pb-16 rounded-md">
      <CardHeader className="text-left px-0 pt-0">
        <CardTitle className="text-[32px] font-semibold mb-6">
          Register Now!!
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
          className="space-y-4 [&_label]:sr-only [&_input]:bg-[#333] [&_input]:text-white [&_input]:border-none [&_input]:h-[48px] [&_input]:rounded-[4px] [&_input]:px-5 focus-visible:[&_input]:ring-0 focus:[&_input]:border-b-2 focus:[&_input]:border-[#e87c03]"
        >
          <form.Field
            name="email"
            validators={{ onChange: registerZodSchema.shape.email }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                placeholder="Email"
              />
            )}
          </form.Field>

          <form.Field
            name="name"
            validators={{ onChange: registerZodSchema.shape.name }}
          >
            {(field) => (
              <AppField
                field={field}
                label="name"
                type="text"
                placeholder="Name"
              />
            )}
          </form.Field>


          {/* Gender Field */}
          <form.Field 
            name="gender" 
            validators={{ onChange: registerZodSchema.shape.gender }}
          >
            {(field) => (
              <div className="flex flex-col gap-2 mt-4">
                <label className="sr-only">Gender</label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger className="w-full bg-[#333] border-none text-white h-[48px] rounded-[4px] px-5 focus:ring-0 focus:border-b-2 focus:border-[#e87c03] focus:rounded-b-none transition-all">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333] text-white border-gray-700">
                    <SelectItem value="MALE" className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 focus:text-white">MALE</SelectItem>
                    <SelectItem value="FEMALE" className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 focus:text-white">FEMALE</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-[#e87c03] mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: registerZodSchema.shape.password }}
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

          {/**====  image file upload  ==== */}
          <form.Field
            name="image"
            validators={{ onChange: registerZodSchema.shape.image }}
          >
            {(field) => (
              <div className="flex flex-col gap-3 mt-4">
                <label className="text-sm font-medium leading-none text-gray-200">
                  Profile Image
                </label>

                <div className="flex items-center gap-4">
                  {/* Shadcn Avatar for the live preview */}
                  <Avatar className="size-16 border border-gray-700">
                    <AvatarImage
                      src={previewUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-800">
                      <User className="size-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Shadcn Input customized for files */}
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer file:text-white file:bg-gray-800 file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-gray-700"
                    onChange={(e) => {
                      // 1. Grab the file from the event
                      const file = e.target.files?.[0];

                      if (file) {
                        // 2. Tell the form state about the file
                        field.handleChange(file);

                        // 3. Create a temporary URL to show the preview
                        setPreviewUrl(URL.createObjectURL(file));
                      } else {
                        field.handleChange(undefined);
                        setPreviewUrl(null);
                      }
                    }}
                  />
                </div>

                {/* Error Handling */}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
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
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton
                  className="w-full bg-[#E50914] hover:bg-[#C11119] text-white h-[48px] font-bold text-[16px] rounded-[4px]"
                  isPending={isSubmitting || isPending}
                  pendingLabel="Signing Up...."
                  disabled={!canSubmit}
                >
                  Sign Up
                </AppSubmitButton>
              )}
            </form.Subscribe>
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
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start bg-transparent px-0 border-t-0 pt-8 space-y-4">
        <p className="text-[16px] text-[#737373]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white font-medium hover:underline"
          >
            Sign in now.
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

export default RegisterForm;