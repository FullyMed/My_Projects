"""Generates the Taiwan Fare Finder app icon from scratch with Pillow.

One-off design script — not part of the app build. Run with:
    python scripts/gen_icon.py
Produces assets/icons/app_icon.png (1024x1024), the source flutter_launcher_icons
uses to regenerate the Android/iOS/web icon sets.
"""

from PIL import Image, ImageDraw

SCALE = 2  # supersample for anti-aliased edges, then downsample
W = H = 1024 * SCALE

TEAL = (15, 118, 110)       # LightModeColors.lightPrimary #0F766E
BLUE = (2, 132, 199)        # LightModeColors.lightSecondary #0284C7
WHITE = (255, 255, 255)

img = Image.new("RGB", (W, H), TEAL)
draw = ImageDraw.Draw(img)

# A fare ticket: rounded card, semicircular notches bitten out of the left
# and right edges, a perforation line separating a stub, and two "route
# line" bars printed on the main section.
cx, cy = W / 2, H / 2
ticket_w, ticket_h = 1320, 740
left, right = cx - ticket_w / 2, cx + ticket_w / 2
top, bottom = cy - ticket_h / 2, cy + ticket_h / 2

draw.rounded_rectangle([left, top, right, bottom], radius=64, fill=WHITE)

notch_r = 175
draw.ellipse([left - notch_r, cy - notch_r, left + notch_r, cy + notch_r], fill=TEAL)
draw.ellipse([right - notch_r, cy - notch_r, right + notch_r, cy + notch_r], fill=TEAL)

# Perforation dividing the stub (left ~30%) from the main section.
perf_x = left + ticket_w * 0.32
dot_r = 14
dot_gap = 64
y = top + 50
while y < bottom - 30:
    draw.ellipse([perf_x - dot_r, y - dot_r, perf_x + dot_r, y + dot_r], fill=TEAL)
    y += dot_gap

# Route-line bars printed on the main section.
bar_h = 68
bar_left = perf_x + 90
bar_right = right - 110
for bar_cy, color, width_frac in ((cy - 90, BLUE, 1.0), (cy + 90, TEAL, 0.62)):
    bw = (bar_right - bar_left) * width_frac
    draw.rounded_rectangle(
        [bar_left, bar_cy - bar_h / 2, bar_left + bw, bar_cy + bar_h / 2],
        radius=bar_h / 2,
        fill=color,
    )

img = img.resize((1024, 1024), Image.LANCZOS)
img.save("assets/icons/app_icon.png")
print("Wrote assets/icons/app_icon.png", img.size, img.mode)
