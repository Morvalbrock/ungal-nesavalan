import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "Ungal Nesavalan — Handwoven Sarees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadDataUrl(relativePath: string, mime: string): Promise<string | null> {
  try {
    const abs = path.join(process.cwd(), "public", relativePath);
    const bytes = await fs.readFile(abs);
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [heroSrc, logoSrc] = await Promise.all([
    loadDataUrl("images/authentic_indian_handloom_silk_saree.png", "image/png"),
    loadDataUrl("images/logo.png", "image/png")
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#f5eddc",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
          {heroSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroSrc}
              alt=""
              width={600}
              height={630}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 60px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt=""
                width={56}
                height={56}
                style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }}
              />
            )}
            <div
              style={{
                fontSize: 22,
                letterSpacing: 5,
                color: "#7a1f2b",
                textTransform: "uppercase",
                fontWeight: 600
              }}
            >
              Ungal Nesavalan
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 68,
                color: "#1a1a1a",
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: -1
              }}
            >
              Handwoven Sarees
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#5a4a3a",
                marginTop: 24,
                lineHeight: 1.35
              }}
            >
              Kanjivaram, Banarasi, Chanderi and more — handloom sarees sourced directly from master weavers.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, color: "#7a1f2b", letterSpacing: 3, textTransform: "uppercase" }}>
              ungalnesavalan.com
            </div>
            <div style={{ fontSize: 18, color: "#666", marginTop: 8 }}>
              Direct from the loom · Handloom Mark certified
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
