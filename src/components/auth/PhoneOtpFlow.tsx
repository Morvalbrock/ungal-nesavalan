"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthField, authInputCls } from "./AuthShell";
import { CountryCodePicker } from "@/components/ui/CountryCodePicker";
import { DEFAULT_COUNTRY, type Country, cleanDigits, formatE164 } from "@/data/countries";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { Loader2, ArrowRight } from "lucide-react";

export type PhoneFlowStep = "phone" | "otp" | "profile";

interface PhoneOtpFlowProps {
  onSuccess: () => void;
  onStepChange?: (step: PhoneFlowStep) => void;
}

function OtpCountdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <span className="text-xs text-ink-muted tabular-nums">
      {remaining > 0 ? `Resend in ${mins}:${secs.toString().padStart(2, "0")}` : ""}
    </span>
  );
}

function getFirebaseErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case "auth/invalid-phone-number":
        return "Invalid mobile number. Please check the digits and try again.";
      case "auth/missing-phone-number":
        return "Please enter your mobile number.";
      case "auth/quota-exceeded":
        return "SMS limit reached for today. Please try again tomorrow.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a few minutes and try again.";
      case "auth/invalid-verification-code":
        return "Incorrect 6-digit OTP. Please check and re-enter.";
      case "auth/code-expired":
        return "This OTP has expired. Please click 'Resend OTP'.";
      case "auth/operation-not-allowed":
        return "Phone authentication is not enabled in your Firebase project. Please enable 'Phone' under Authentication > Sign-in method in Firebase Console.";
      case "auth/unauthorized-domain":
        return "This domain/IP is not authorized in Firebase. Please test on http://localhost:3000, or add this IP to Authorized Domains in Firebase Console.";
      case "auth/app-not-authorized":
        return "This app is not authorized to use Firebase Authentication. Verify Phone Authentication is enabled.";
      case "auth/captcha-check-failed":
        return "reCAPTCHA check failed. Please refresh the page and try again.";
      default:
        if ("message" in err && typeof (err as { message: unknown }).message === "string") {
          return (err as { message: string }).message;
        }
    }
  }
  return err instanceof Error ? err.message : "Authentication failed. Please try again.";
}

export function PhoneOtpFlow({ onSuccess, onStepChange }: PhoneOtpFlowProps) {
  const [step, setStep] = useState<PhoneFlowStep>("phone");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);

  // New user profile form state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const { refresh } = useAuth();

  const updateStep = (newStep: PhoneFlowStep) => {
    setStep(newStep);
    onStepChange?.(newStep);
  };

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const initRecaptcha = (auth: ReturnType<typeof getFirebaseAuth>) => {
    if (!auth) return null;
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      }
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handlePhoneInputChange = (val: string) => {
    const digits = cleanDigits(val).slice(0, country.maxLength);
    setNationalNumber(digits);
    setValidationError(null);
    setServerError(null);
  };

  const handleCountryChange = (c: Country) => {
    setCountry(c);
    setNationalNumber("");
    setValidationError(null);
    setServerError(null);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // Validate phone number according to country rules
    const digits = cleanDigits(nationalNumber);
    if (country.validate) {
      const err = country.validate(digits);
      if (err) {
        setValidationError(err);
        return;
      }
    } else {
      if (digits.length < country.minLength || digits.length > country.maxLength) {
        setValidationError(`Phone number must be ${country.minLength}-${country.maxLength} digits`);
        return;
      }
    }

    const fullPhone = formatE164(country.dialCode, digits);
    setLoading(true);

    try {
      // 1. Check if user already exists in our system
      try {
        const checkRes = await fetch("/api/auth/check-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone })
        });
        if (checkRes.ok) {
          const checkData = (await checkRes.json()) as { exists: boolean };
          setIsExistingUser(checkData.exists);
        }
      } catch {
        // Non-fatal if check fails
      }

      // 2. Send OTP via Firebase
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase Auth could not be initialized");

        const verifier = initRecaptcha(auth);
        if (!verifier) throw new Error("Failed to initialize security verification");

        const confirmation = await signInWithPhoneNumber(auth, fullPhone, verifier);
        confirmationResultRef.current = confirmation;
      } else {
        // Fallback for dev mode
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Failed to send OTP");
        }
      }

      updateStep("otp");
      setCanResend(false);
      setCountdownKey((k) => k + 1);
    } catch (err: unknown) {
      console.error("[OTP] send error:", err);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      setServerError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const code = cleanDigits(otpCode);
    if (code.length !== 6) {
      setServerError("Please enter all 6 digits of your OTP");
      return;
    }

    const fullPhone = formatE164(country.dialCode, nationalNumber);
    setLoading(true);

    try {
      let isNewUser = false;

      if (isFirebaseConfigured() && confirmationResultRef.current) {
        // Confirm with Firebase
        const userCredential = await confirmationResultRef.current.confirm(code);
        const idToken = await userCredential.user.getIdToken();

        // Exchange for session cookie
        const res = await fetch("/api/auth/firebase-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            phone: userCredential.user.phoneNumber || fullPhone
          })
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Login failed");
        }

        const data = (await res.json()) as { success: boolean; isNewUser: boolean };
        isNewUser = Boolean(data.isNewUser);
      } else {
        // Fallback for dev mode
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone, otp: code })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Invalid OTP");
        }
        isNewUser = isExistingUser === false;
      }

      await refresh();

      if (isNewUser) {
        // New user: ask them for name/email
        updateStep("profile");
      } else {
        // Existing user: direct access to home/target
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("[OTP] verify error:", err);
      setServerError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setServerError(null);
    setLoading(true);

    const fullPhone = formatE164(country.dialCode, nationalNumber);

    try {
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase Auth could not be initialized");
        const verifier = initRecaptcha(auth);
        if (!verifier) throw new Error("Failed to initialize security verification");

        const confirmation = await signInWithPhoneNumber(auth, fullPhone, verifier);
        confirmationResultRef.current = confirmation;
      } else {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Failed to resend OTP");
        }
      }

      setCanResend(false);
      setCountdownKey((k) => k + 1);
    } catch (err: unknown) {
      console.error("[OTP] resend error:", err);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      setServerError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete profile for new user
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setLoading(true);

    try {
      const patch: { name?: string; email?: string } = {};
      if (profileName.trim()) patch.name = profileName.trim();
      if (profileEmail.trim()) patch.email = profileEmail.trim();

      if (Object.keys(patch).length > 0) {
        const res = await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Failed to save profile");
        }
      }

      await refresh();
      onSuccess();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    onSuccess();
  };

  const handleChangeNumber = () => {
    if (loading) return;
    setOtpCode("");
    setServerError(null);
    updateStep("phone");
  };

  const handleExpire = useCallback(() => setCanResend(true), []);

  return (
    <div className="relative">
      {/* Invisible reCAPTCHA container required by Firebase */}
      <div id="recaptcha-container" />

      {/* Loading lockout backdrop to prevent any background action */}
      {loading && (
        <div className="absolute -inset-2 z-40 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 text-ink">
            <Loader2 className="h-6 w-6 animate-spin text-maroon" />
            <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              {step === "phone" ? "Sending code…" : step === "otp" ? "Verifying…" : "Saving…"}
            </span>
          </div>
        </div>
      )}

      {/* STEP 1: ENTER PHONE NUMBER */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <AuthField label="Mobile number" error={validationError ?? undefined}>
            <div className="flex">
              <CountryCodePicker
                selected={country}
                onSelect={handleCountryChange}
                disabled={loading}
              />
              <input
                type="tel"
                inputMode="numeric"
                value={nationalNumber}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                placeholder={country.placeholder}
                autoComplete="tel-national"
                disabled={loading}
                className={`${authInputCls} rounded-l-none font-medium tracking-wide`}
              />
            </div>
          </AuthField>

          {country.code === "IN" && (
            <p className="text-[11px] text-ink-muted">
              Enter 10-digit Indian mobile number without country code
            </p>
          )}

          {serverError && <p className="text-xs text-maroon">{serverError}</p>}

          <button
            type="submit"
            disabled={loading || nationalNumber.length === 0}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <span>Send OTP</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* STEP 2: ENTER OTP (LOCKED STATE) */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-card border border-border/80 bg-cream/70 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {isExistingUser ? "Welcome back" : "Welcome"}
                </p>
                <p className="mt-0.5 text-xs text-ink">
                  Code sent to{" "}
                  <span className="font-semibold tabular-nums text-ink">
                    {country.dialCode} {nationalNumber}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleChangeNumber}
                disabled={loading}
                className="text-xs font-medium text-maroon underline decoration-maroon/40 underline-offset-4 hover:decoration-maroon"
              >
                Change
              </button>
            </div>
          </div>

          <AuthField label="Enter 6-digit OTP">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="● ● ● ● ● ●"
              value={otpCode}
              onChange={(e) => {
                setOtpCode(cleanDigits(e.target.value).slice(0, 6));
                setServerError(null);
              }}
              disabled={loading}
              autoFocus
              className={`${authInputCls} text-center text-xl font-bold tracking-[0.5em] text-ink`}
            />
          </AuthField>

          <div className="flex items-center justify-between pt-1">
            <OtpCountdown key={countdownKey} seconds={30} onExpire={handleExpire} />
            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-xs font-semibold uppercase tracking-wider text-maroon underline decoration-maroon/40 underline-offset-4 hover:decoration-maroon"
              >
                Resend OTP
              </button>
            )}
          </div>

          {serverError && <p className="text-xs text-maroon">{serverError}</p>}

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="btn-primary w-full"
          >
            {loading ? "Verifying…" : "Verify & Sign in"}
          </button>
        </form>
      )}

      {/* STEP 3: COMPLETE PROFILE (FOR NEW USERS) */}
      {step === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-display text-xl text-ink">Welcome to Ungal Nesavalan</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Add your name so our master weavers and atelier stylists can personalize your orders.
            </p>
          </div>

          <AuthField label="Your full name">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Priya Sundaram"
              autoComplete="name"
              disabled={loading}
              className={authInputCls}
            />
          </AuthField>

          <AuthField label="Email address (optional)">
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="priya@example.com"
              autoComplete="email"
              disabled={loading}
              className={authInputCls}
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Used for digital order receipts and courier dispatch updates.
            </p>
          </AuthField>

          {serverError && <p className="text-xs text-maroon">{serverError}</p>}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Saving…" : "Save & Continue"}
            </button>

            <button
              type="button"
              onClick={handleSkipProfile}
              disabled={loading}
              className="w-full py-2 text-center text-xs text-ink-muted transition hover:text-ink hover:underline"
            >
              I&apos;ll do this later (Skip)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
