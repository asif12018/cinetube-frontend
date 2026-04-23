"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {  verifyEmail } from "@/app/(commonLayout)/(authRouteGroup)/verify-email/_action";
import { resendOtpAction } from "@/service/otp.service";
import { toast, Toaster } from "sonner";


const RESEND_COOLDOWN = 60; // seconds

interface OtpVerifyFormProps {
  email: string;
}

export default function OtpVerifyForm({ email }: OtpVerifyFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current!);
  }, []);

  function startCountdown() {
    setCanResend(false);
    setTimer(RESEND_COOLDOWN);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) {
      setMessage({ text: "Please enter the full 6-digit code.", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await verifyEmail({ email, otp: code });
    setLoading(false);
    if (res.success) {
      setMessage({ text: res.message, ok: true });
      router.push(res.redirectUrl ?? "/");
    } else {
      setMessage({ text: res.message, ok: false });
    }
  }

 const handleResend = async () => {
  setLoading(true);
  console.log('this is email', email)
  const result = await resendOtpAction(email);
  
  if (result.success) {
    toast.success("OTP resent to your email!");
    setTimer(120); // reset 2min countdown (matches your expiresIn: 2 * 60)
  } else {
    toast.error(result.message);
  }
  setLoading(false);
};

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto p-8">
      <div className="text-center">
        <h1 className="text-xl font-medium">Check your email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <Toaster />

      {/* OTP inputs */}
      <div className="flex gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-13 text-center text-xl font-medium border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white bg-white/10 backdrop-blur-sm"
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify email"}
      </button>

      {/* Resend section */}
      <div className="text-sm text-muted-foreground text-center">
        Didn't receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className="text-primary disabled:text-muted-foreground disabled:cursor-not-allowed font-medium"
        >
          {resending
            ? "Sending..."
            : canResend
            ? "Resend OTP"
            : `Resend in ${timer}s`}
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`w-full rounded-md px-4 py-3 text-sm text-center font-semibold ${
            message.ok
              ? "bg-[#1a8a3c] border border-green-400/40 text-white"
              : "bg-[#e87c03] border border-orange-400/40 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}