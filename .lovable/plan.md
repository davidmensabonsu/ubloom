

## Remove White Background from Logo

The logo image (`src/assets/logo.png`) currently has a white background. We'll use the Lovable AI image editing API to generate a version with a transparent background, then replace the file.

### Steps

1. **Create a backend function** that takes the current logo, sends it to the AI image model (`google/gemini-2.5-flash-image`) with an instruction to remove the white background and output only the flower/petals on a transparent background.

2. **Download and replace** `src/assets/logo.png` with the transparent version.

3. **Verify** the logo renders correctly across all pages (Welcome, Home header, Bottom Nav) without any white box behind the petals.

### Technical Details

- Use the `google/gemini-2.5-flash-image` model via the Lovable AI gateway with the editing prompt: "Remove the white background from this logo, keep only the flower petals, output on a fully transparent background"
- The result will be a PNG with alpha transparency
- An edge function will handle the processing, returning the cleaned image as base64
- The base64 output will be saved as the new `src/assets/logo.png`

