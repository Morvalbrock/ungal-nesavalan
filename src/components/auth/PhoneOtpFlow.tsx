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
        if (typeof window !== "undefined") {
          const host = window.location.hostname;
          const isRawIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
          if (isRawIp) {
            return `Phone auth cannot run on a raw IP address (${host}). Open the app at http://localhost:3000 on this machine, or use ngrok to get a real hostname, or add a test phone number in Firebase Console → Authentication → Sign-in method → Phone → "Phone numbers for testing".`;
          }
          return `reCAPTCHA failed for "${host}". Add this domain to Firebase Console → Authentication → Settings → Authorized domains, then reload.`;
        }
        return "reCAPTCHA check failed. Please refresh the page and try again.";
      case "auth/argument-error":
        return "reCAPTCHA could not be initialized. Please reload the page and try again.";
      case "auth/internal-error":
        return "Firebase could not verify this request. Check that your domain is in Authorized domains and reload the page.";
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
      document
        .querySelectorAll("[data-recaptcha-container]")
        .forEach((el) => el.remove());
    };
  }, []);

  const initRecaptcha = async (auth: ReturnType<typeof getFirebaseAuth>) => {
    if (!auth) return null;

    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }

    // Remove any previously-created dynamic container(s). Firebase's SDK
    // binds grecaptcha widget state to the DOM node, so reusing the same node
    // across attempts throws "reCAPTCHA has already been rendered".
    document
      .querySelectorAll("[data-recaptcha-container]")
      .forEach((el) => el.remove());

    const containerId = `recaptcha-container-${Date.now()}`;
    const container = document.createElement("div");
    container.id = containerId;
    container.setAttribute("data-recaptcha-container", "");
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.width = "0";
    container.style.height = "0";
    container.style.overflow = "hidden";
    container.style.visibility = "hidden";
    document.body.appendChild(container);

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        try {
          verifier.clear();
        } catch {
          // ignore
        }
      }
    });

    try {
      await verifier.render();
    } catch (renderErr) {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "(unknown)";
      const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "(missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)";
      console.error(
        `[OTP] reCAPTCHA render failed.\n  hostname: ${hostname}\n  authDomain: ${authDomain}\n  Fix: Firebase Console → Authentication → Settings → Authorized domains must include "${hostname}".`,
        renderErr
      );
      throw renderErr;
    }

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

        const verifier = await initRecaptcha(auth);
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
        const verifier = await initRecaptcha(auth);
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
      {/* reCAPTCHA container is created dynamically in document.body on each
          send attempt. See initRecaptcha. */}

      {/* Loading lockout backdrop to prevent any background action */}
      {loading && (
        <div className="absolute -inset-2 z-40 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 text-slate-800">
            <Loader2 className="h-6 w-6 animate-spin text-[#3c124d]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {step === "phone" ? "Sending code…" : step === "otp" ? "Verifying…" : "Saving…"}
            </span>
          </div>
        </div>
      )}

      {/* STEP 1: ENTER PHONE NUMBER */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <AuthField label="Mobile Number" error={validationError ?? undefined}>
            <div className="flex rounded-xl shadow-xs border border-slate-300 focus-within:border-[#3c124d] focus-within:ring-2 focus-within:ring-[#3c124d]/20 overflow-hidden bg-white">
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
                className="flex-1 border-0 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
              />
            </div>
          </AuthField>

          {country.code === "IN" && (
            <p className="text-[11px] text-slate-500">
              Enter 10-digit Indian mobile number without country code
            </p>
          )}

          {serverError && <p className="text-xs text-rose-600 font-medium">{serverError}</p>}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || nationalNumber.length === 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>Send Verification OTP</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ENTER OTP (LOCKED STATE) */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-xl border border-[#e8dbf2] bg-[#f3ecf8]/60 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {isExistingUser ? "Welcome Back" : "Welcome"}
                </p>
                <p className="mt-0.5 text-xs text-slate-800">
                  Code sent to{" "}
                  <span className="font-bold tabular-nums text-[#3c124d]">
                    {country.dialCode} {nationalNumber}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleChangeNumber}
                disabled={loading}
                className="text-xs font-semibold text-[#3c124d] underline decoration-[#c9933b]/50 underline-offset-4 hover:text-[#4e1a61]"
              >
                Change
              </button>
            </div>
          </div>

          <AuthField label="Enter 6-Digit OTP">
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
              className={`${authInputCls} text-center text-xl font-bold tracking-[0.5em] text-[#3c124d]`}
            />
          </AuthField>

          <div className="flex items-center justify-between pt-1">
            <OtpCountdown key={countdownKey} seconds={30} onExpire={handleExpire} />
            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-xs font-semibold uppercase tracking-wider text-[#3c124d] underline decoration-[#c9933b]/50 underline-offset-4 hover:text-[#4e1a61]"
              >
                Resend OTP
              </button>
            )}
          </div>

          {serverError && <p className="text-xs text-rose-600 font-medium">{serverError}</p>}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? "Verifying…" : "Verify & Sign in"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: COMPLETE PROFILE (FOR NEW USERS) */}
      {step === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="border-b border-[#f3ecf8] pb-3">
            <h3 className="font-heritage text-xl font-bold text-[#3c124d]">Welcome to Ungal Nesavalan</h3>
            <p className="mt-1 text-xs text-slate-500">
              Add your name so our master weavers and atelier stylists can personalize your orders.
            </p>
          </div>

          <AuthField label="Your Full Name">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Priyadarshini Sundaram"
              autoComplete="name"
              disabled={loading}
              className={authInputCls}
            />
          </AuthField>

          <AuthField label="Email Address (Optional)">
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="priya@royalatelier.in"
              autoComplete="email"
              disabled={loading}
              className={authInputCls}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Used for digital order receipts and courier dispatch updates.
            </p>
          </AuthField>

          {serverError && <p className="text-xs text-rose-600 font-medium">{serverError}</p>}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? "Saving…" : "Save & Continue"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              type="button"
              onClick={handleSkipProfile}
              disabled={loading}
              className="w-full py-2 text-center text-xs text-slate-500 transition hover:text-[#3c124d] hover:underline"
            >
              I&apos;ll do this later (Skip)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
