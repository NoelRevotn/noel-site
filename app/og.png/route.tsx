import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** Static Open Graph image (1200×630) in the signage look, rendered at export time. */
export function GET() {
  const line = (color: string, top: number, width: number) => (
    <div
      style={{ position: "absolute", left: 640, top, width, height: 16, borderRadius: 8, background: color }}
    />
  );
  return new ImageResponse(
    <div
      style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", position: "relative" }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 64, height: 14, background: "#0f1e33" }} />
      {line("#c8102e", 260, 480)}
      {line("#00843d", 330, 420)}
      {line("#0057b8", 400, 460)}
      <div
        style={{
          position: "absolute",
          left: 860,
          top: 300,
          width: 72,
          height: 72,
          borderRadius: 36,
          background: "#0f1e33",
          border: "10px solid #ffffff",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", padding: "170px 72px", color: "#0f1e33" }}>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>Noel</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>Echeverría</div>
        <div style={{ fontSize: 30, marginTop: 36, maxWidth: 520, color: "#4a5a70" }}>
          Systems & Computer Engineering student building AI agents and data tools in Python.
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
