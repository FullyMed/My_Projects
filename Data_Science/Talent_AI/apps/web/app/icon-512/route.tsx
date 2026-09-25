import { ImageResponse } from "next/og";
import { IconBadge } from "../_lib/icon-badge";

export async function GET() {
  return new ImageResponse(<IconBadge size={512} fontSize={320} />, {
    width: 512,
    height: 512,
  });
}
