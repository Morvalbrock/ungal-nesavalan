export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data must be rendered as raw JSON in the HTML source.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
