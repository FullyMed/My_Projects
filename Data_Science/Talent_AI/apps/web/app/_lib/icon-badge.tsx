/** Shared visual for every generated app icon (favicon, apple-icon,
 * manifest icons) -- one place so the mark stays identical across sizes.
 * Underscore-prefixed folder = a Next.js "private folder", excluded from
 * routing, so this can't accidentally become its own route. */
export function IconBadge({ size, fontSize }: { size: number; fontSize: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#4f46e5",
        borderRadius: "22%",
        color: "white",
        fontSize,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}
    >
      T
    </div>
  );
}
