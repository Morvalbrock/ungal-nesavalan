import { ImageResponse } from "next/og";
import { productRepo } from "@/server/repositories";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) {
    return new Response("not_found", { status: 404 });
  }

  const primaryImage = product.images[0]?.url;
  const priceRupees = ((product.salePrice ?? product.basePrice) / 100).toLocaleString("en-IN");

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
          {primaryImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
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
            padding: "60px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#7a1f2b", textTransform: "uppercase" }}>
              Ungal Nesavalan
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#666",
                marginTop: 24,
                textTransform: "uppercase",
                letterSpacing: 2
              }}
            >
              {product.weave} · {product.fabric}
            </div>
            <div
              style={{
                fontSize: 64,
                color: "#1a1a1a",
                marginTop: 20,
                fontWeight: 500,
                lineHeight: 1.05
              }}
            >
              {product.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, color: "#1a1a1a", fontWeight: 600 }}>
              ₹{priceRupees}
            </div>
            <div style={{ fontSize: 18, color: "#666", marginTop: 8 }}>
              Handloom · Loomed by hand
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
