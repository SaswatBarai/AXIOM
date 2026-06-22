import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f97316",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "7px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: "#000",
          letterSpacing: "-0.03em",
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
