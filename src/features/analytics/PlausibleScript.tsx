import Script from "next/script";

// Renders the Plausible tagger only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
// Gate lets you deploy without analytics wired up.
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <>
      <Script
        strategy="afterInteractive"
        data-domain={domain}
        src="https://plausible.io/js/script.tagged-events.js"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments); };`}
      </Script>
    </>
  );
}
