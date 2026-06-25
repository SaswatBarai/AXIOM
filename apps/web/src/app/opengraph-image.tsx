import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
            borderRadius: "9999px",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "#f97316",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 30,
              color: "#000",
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 28, color: "#fff", letterSpacing: "-0.02em" }}>
            AXIOM
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontWeight: 800,
            fontSize: 72,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "880px",
          }}
        >
          Your AI Career{" "}
          <span style={{ color: "#f97316" }}>Copilot</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontWeight: 400,
            fontSize: 26,
            color: "#71717a",
            marginTop: "24px",
            maxWidth: "740px",
            lineHeight: 1.5,
          }}
        >
          Resume analysis, job matching, skill gaps & interview prep — in one dashboard.
        </div>

        {/* CTA pill */}
        <div
          style={{
            marginTop: "48px",
            background: "#f97316",
            color: "#000",
            fontWeight: 700,
            fontSize: 18,
            padding: "14px 32px",
            borderRadius: "9999px",
          }}
        >
          Get Started Free →
        </div>
      </div>
    ),
    { ...size }
  );
}
