import { ImageResponse } from "next/og";
import { IconBadge } from "./_lib/icon-badge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<IconBadge size={32} fontSize={20} />, { ...size });
}
