"""Cut the static Plus Jakarta Sans weights the app ships from the variable font.

Flutter doesn't map FontWeight onto a variable font's wght axis: with only the
variable file bundled, every weight rendered as Regular. So pubspec.yaml lists
one static file per weight, and this script makes them.

Run from the project root (needs fontTools: `pip install fonttools`):

    python scripts/gen_fonts.py
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = "assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"
WEIGHTS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}

for weight, name in WEIGHTS.items():
    font = instancer.instantiateVariableFont(TTFont(SOURCE), {"wght": weight}, updateFontNames=True)
    out = f"assets/fonts/PlusJakartaSans-{name}.ttf"
    font.save(out)
    print(f"wrote {out}")
