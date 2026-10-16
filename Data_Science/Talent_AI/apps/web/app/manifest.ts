import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Talent AI",
    short_name: "Talent AI",
    description: "Rank resumes against a job description.",
    start_url: "/dashboard/candidates",
    display: "standalone",
    background_color: "#fafafa", // matches --background in globals.css
    theme_color: "#4f46e5", // matches --accent in globals.css
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
