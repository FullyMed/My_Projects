import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // don't advertise the framework (X-Powered-By)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // MIME-sniffing protection -- stops a browser from executing an
          // uploaded/served file as something other than its declared type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection -- this dashboard never needs to be
          // embedded in another site's iframe.
          { key: "X-Frame-Options", value: "DENY" },
          // Don't leak the full URL (which can carry a job/candidate id) to
          // third-party sites via the Referer header on outbound links.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features this app never uses.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
