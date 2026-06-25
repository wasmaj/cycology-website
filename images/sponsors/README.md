# Sponsor logos

Drop each sponsor's logo into this folder using the **exact filename** below.
The logo then appears automatically on `pages/sponsors.html`, on top of that
sponsor's card. Until a file is added, the card just shows the sponsor name —
nothing looks broken.

## Filenames (must match exactly)

| Sponsor | File to add |
|---|---|
| Technogym (Gold) | `technogym.png` |
| Ilubirin | `ilubirin.png` |
| Contec Global | `contec-global.png` |
| G4S Secure Solutions Nigeria | `g4s.png` |
| NowNow | `nownow.png` |
| Bluechip Technologies | `bluechip-technologies.png` |
| Power Oil | `power-oil.png` |
| Watch Galleries Limited | `watch-galleries.png` |
| Heirs Insurance Group | `heirs-insurance.png` |
| Netcorecloud | `netcorecloud.png` |
| Avis Nigeria | `avis.png` |
| Austine Water | `austine-water.png` |
| Pharmarun | `pharmarun.png` |

## Tips
- **Format:** PNG with a transparent background looks best (SVG also works —
  just keep the `.png` name, or update the `src` in `pages/sponsors.html`).
- **Size:** roughly 400 × 200 px, logo centred. Logos are auto-scaled to a
  uniform height, so exact dimensions don't matter much.
- **Keep it light:** compress under ~50 KB each.

## Adding a brand-new sponsor
1. Add the logo file here.
2. In `pages/sponsors.html`, copy an existing `<article class="partner">` block,
   change the name/description/link, and set the `<img src>` to your new file.
