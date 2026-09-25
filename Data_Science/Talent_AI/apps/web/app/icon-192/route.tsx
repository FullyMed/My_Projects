import { ImageResponse } from "next/og";
import { IconBadge } from "../_lib/icon-badge";

// Not the special `icon.tsx` convention (that's one size only) -- a plain
// route so manifest.ts can reference a fixed-size PNG for PWA icons.
export async function GET() {
  return new ImageResponse(<IconBadge size={192} fontSize={120} />, {
    width: 192,
    height: 192,
  });
}
