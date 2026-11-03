export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
  validate?: (nationalNumber: string) => string | null;
}

export const COUNTRIES: Country[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    minLength: 10,
    maxLength: 10,
    placeholder: "98765 43210",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 10) return "Indian mobile numbers must be exactly 10 digits";
      if (!/^[6-9]/.test(digits)) return "Indian mobile numbers must start with 6, 7, 8, or 9";
      return null;
    }
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    minLength: 9,
    maxLength: 9,
    placeholder: "50 123 4567",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 9) return "UAE mobile numbers must be 9 digits";
      if (!digits.startsWith("5")) return "UAE mobile numbers must start with 5";
      return null;
    }
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    minLength: 8,
    maxLength: 8,
    placeholder: "8123 4567",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 8) return "Singapore mobile numbers must be 8 digits";
      if (!/^[89]/.test(digits)) return "Singapore mobile numbers must start with 8 or 9";
      return null;
    }
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
    minLength: 9,
    maxLength: 10,
    placeholder: "12 345 6789",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length < 9 || digits.length > 10) return "Malaysia numbers must be 9-10 digits";
      return null;
    }
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    minLength: 10,
    maxLength: 10,
    placeholder: "(555) 012-3456",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 10) return "US phone numbers must be 10 digits";
      return null;
    }
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    minLength: 10,
    maxLength: 11,
    placeholder: "7123 456789",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length < 10 || digits.length > 11) return "UK mobile numbers must be 10-11 digits";
      return null;
    }
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    minLength: 9,
    maxLength: 9,
    placeholder: "412 345 678",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 9) return "Australia mobile numbers must be 9 digits (excluding leading 0)";
      return null;
    }
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    minLength: 10,
    maxLength: 10,
    placeholder: "(555) 012-3456",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 10) return "Canada phone numbers must be 10 digits";
      return null;
    }
  },
  {
    code: "LK",
    name: "Sri Lanka",
    dialCode: "+94",
    flag: "🇱🇰",
    minLength: 9,
    maxLength: 9,
    placeholder: "71 234 5678",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 9) return "Sri Lanka mobile numbers must be 9 digits";
      return null;
    }
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    minLength: 9,
    maxLength: 9,
    placeholder: "50 123 4567",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 9) return "Saudi mobile numbers must be 9 digits";
      return null;
    }
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    flag: "🇶🇦",
    minLength: 8,
    maxLength: 8,
    placeholder: "3312 3456",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 8) return "Qatar mobile numbers must be 8 digits";
      return null;
    }
  },
  {
    code: "KW",
    name: "Kuwait",
    dialCode: "+965",
    flag: "🇰🇼",
    minLength: 8,
    maxLength: 8,
    placeholder: "5123 4567",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 8) return "Kuwait mobile numbers must be 8 digits";
      return null;
    }
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    minLength: 10,
    maxLength: 11,
    placeholder: "151 23456789",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length < 10 || digits.length > 11) return "Germany phone numbers must be 10-11 digits";
      return null;
    }
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    minLength: 9,
    maxLength: 9,
    placeholder: "6 12 34 56 78",
    validate: (digits: string) => {
      if (digits.length === 0) return "Mobile number is required";
      if (digits.length !== 9) return "France phone numbers must be 9 digits";
      return null;
    }
  }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

export function getCountryByCode(code: string): Country {
  return COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase()) ?? DEFAULT_COUNTRY;
}

export function cleanDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function formatE164(dialCode: string, nationalNumber: string): string {
  const digits = cleanDigits(nationalNumber);
  const cleanDial = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return `${cleanDial}${digits}`;
}
