# Tile templates

JanCame uses PNG template images for OpenCV template matching.

## Files

- Path: `public/assets/tiles/{id}.png`
- Naming: `1m.png` … `9m.png`, `1p.png` … `9p.png`, `1s.png` … `9s.png`, `E,S,W,N,P,F,C.png`
- Size: 48×64 px

## Regenerate bundled templates

```bash
pnpm generate:templates
```

This runs `scripts/generate-tile-templates.mjs` and overwrites the PNG files in this directory.

## Use your own tile photos

1. Photograph each tile face-on with consistent lighting and background
2. Crop to the tile face and resize to 48×64 px
3. Save as `{id}.png` in this directory
4. Reload the app (hard refresh if needed)

Matching works best when your photos resemble the lighting and angle used during recognition.
