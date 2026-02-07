#!/usr/bin/env python3
"""
One-time script to process Shopee icon:
- Remove white background
- Invert black logo to white
- Save as PNG with transparency
"""

from PIL import Image
import os

# Input and output paths
input_path = os.path.join('public', 'icons', 'shopee.jpg')
output_path = os.path.join('public', 'icons', 'shopee.png')

# Load the image
img = Image.open(input_path)

# Convert to RGBA (for transparency support)
img = img.convert('RGBA')

# Get pixel data
pixels = img.load()
width, height = img.size

# Process each pixel
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]

        # Check if pixel is close to white (background)
        # Using threshold of 200 for each RGB channel
        if r > 200 and g > 200 and b > 200:
            # Make it transparent
            pixels[x, y] = (0, 0, 0, 0)
        else:
            # Invert the color (black -> white) and keep fully opaque
            pixels[x, y] = (255 - r, 255 - g, 255 - b, 255)

# Save as PNG
img.save(output_path, 'PNG')

print(f'[SUCCESS] Processed icon saved to: {output_path}')
print(f'  - Background removed (white -> transparent)')
print(f'  - Logo inverted (black -> white)')
print(f'  - Format: PNG with alpha channel')
