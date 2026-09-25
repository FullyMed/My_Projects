import { ImageResponse } from "next/og";
import { IconBadge } from "./_lib/icon-badge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconBadge size={180} fontSize={112} />, { ...size });
}
