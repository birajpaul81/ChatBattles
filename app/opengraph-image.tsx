import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ChatBattles.ai - Compare AI Models Side-by-Side";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "#0D0D0D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(253, 99, 22, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#FFFFFF",
              marginBottom: 20,
            }}
          >
            ChatBattles<span style={{ color: "#FD6316" }}>.ai</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#BFBFBF",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            ⚔️ Battle the smartest AIs — all in one chat
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

