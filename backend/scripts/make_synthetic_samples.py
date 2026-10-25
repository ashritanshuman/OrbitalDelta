"""Generate 4 realistic synthetic satellite change-detection image pairs."""

from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_SAMPLES_DIR = SCRIPT_DIR.parent / "samples"
FRONTEND_SAMPLES_DIR = SCRIPT_DIR.parent.parent / "frontend" / "public" / "samples"


def generate_textured_surface(width: int, height: int, base_rgb: tuple, noise_scale: float = 25.0) -> np.ndarray:
    """Generate a textured background with Gaussian spatial noise."""
    base = np.zeros((height, width, 3), dtype=np.float32)
    for c in range(3):
        base[:, :, c] = base_rgb[c]

    # Add multiscale noise
    noise1 = np.random.normal(0, noise_scale, (height, width, 3))
    noise2 = np.random.normal(0, noise_scale * 0.5, (height // 4, width // 4, 3))
    
    # Upsample noise2
    noise2_pil = Image.fromarray(np.clip(noise2 + 128, 0, 255).astype(np.uint8)).resize(
        (width, height), Image.Resampling.BILINEAR
    )
    noise2_up = np.array(noise2_pil, dtype=np.float32) - 128

    textured = np.clip(base + noise1 + noise2_up, 0, 255).astype(np.uint8)
    return textured


def make_forest_pair(width=1200, height=800) -> tuple:
    """Pair 1: Forest canopy with cleared logging/deforestation corridor."""
    # T1: Dense green canopy with darker river curve
    t1_np = generate_textured_surface(width, height, (34, 88, 38), noise_scale=22.0)
    t1_pil = Image.fromarray(t1_np)
    draw1 = ImageDraw.Draw(t1_pil)
    # Winding natural river
    draw1.line([(0, 400), (300, 380), (600, 480), (900, 420), (1200, 450)], fill=(24, 45, 60), width=45)
    t1_pil = t1_pil.filter(ImageFilter.GaussianBlur(1))

    # T2: Forest with linear clearcuts and dirt access road
    t2_pil = t1_pil.copy()
    draw2 = ImageDraw.Draw(t2_pil)
    # Rectangular clearcut (R1)
    draw2.rectangle([(160, 220), (450, 400)], fill=(155, 120, 85))
    # Unpaved logging road (R2)
    draw2.line([(400, 300), (700, 600), (1050, 620)], fill=(168, 130, 95), width=18)
    t2_pil = t2_pil.filter(ImageFilter.GaussianBlur(0.8))

    return t1_pil, t2_pil


def make_urban_pair(width=1200, height=800) -> tuple:
    """Pair 2: Open undeveloped terrain vs new building blocks and highway grid."""
    # T1: Dry brown/tan soil with sparse bushes
    t1_np = generate_textured_surface(width, height, (135, 125, 110), noise_scale=18.0)
    t1_pil = Image.fromarray(t1_np)

    # T2: Construction development with gray concrete foundations and road network
    t2_pil = t1_pil.copy()
    draw2 = ImageDraw.Draw(t2_pil)
    # Commercial warehouse slabs
    draw2.rectangle([(250, 250), (480, 450)], fill=(195, 200, 205), outline=(230, 235, 240), width=3)
    draw2.rectangle([(620, 180), (920, 360)], fill=(185, 190, 195), outline=(225, 230, 235), width=3)
    # New asphalt dual-carriageway
    draw2.line([(100, 650), (1100, 650)], fill=(45, 48, 52), width=28)
    t2_pil = t2_pil.filter(ImageFilter.GaussianBlur(0.5))

    return t1_pil, t2_pil


def make_coastal_pair(width=1200, height=800) -> tuple:
    """Pair 3: Pristine sandbar and coastline vs eroded receded shoreline."""
    # T1: Deep blue ocean and sandy barrier island
    t1_np = generate_textured_surface(width, height, (20, 55, 95), noise_scale=14.0)
    t1_pil = Image.fromarray(t1_np)
    draw1 = ImageDraw.Draw(t1_pil)
    # Golden sand spit
    draw1.polygon([(200, 800), (400, 350), (700, 250), (1000, 450), (1200, 800)], fill=(210, 190, 140))
    t1_pil = t1_pil.filter(ImageFilter.GaussianBlur(1))

    # T2: Storm surge erosion receding shoreline 100m inland
    t2_np = generate_textured_surface(width, height, (20, 55, 95), noise_scale=14.0)
    t2_pil = Image.fromarray(t2_np)
    draw2 = ImageDraw.Draw(t2_pil)
    # Receded island contour
    draw2.polygon([(280, 800), (460, 480), (680, 400), (920, 560), (1100, 800)], fill=(195, 175, 130))
    t2_pil = t2_pil.filter(ImageFilter.GaussianBlur(1))

    return t1_pil, t2_pil


def make_flood_pair(width=1200, height=800) -> tuple:
    """Pair 4: Agricultural crop grid vs muddy inundation flood zone."""
    # T1: Pattern of agricultural crop fields (greens, tans, light brown)
    t1_np = generate_textured_surface(width, height, (90, 120, 70), noise_scale=15.0)
    t1_pil = Image.fromarray(t1_np)
    draw1 = ImageDraw.Draw(t1_pil)
    # Draw field grid lines
    for x in range(150, width, 180):
        draw1.line([(x, 0), (x, height)], fill=(75, 95, 60), width=2)
    for y in range(120, height, 140):
        draw1.line([(0, y), (width, y)], fill=(75, 95, 60), width=2)
    # Narrow normal river
    draw1.line([(300, 0), (500, 400), (750, 800)], fill=(30, 60, 85), width=24)

    # T2: Overflowing flooded basin covering fields
    t2_pil = t1_pil.copy()
    draw2 = ImageDraw.Draw(t2_pil)
    # Saturated muddy floodwater polygons
    draw2.polygon([(250, 100), (650, 250), (900, 600), (550, 750), (280, 500)], fill=(38, 55, 72))
    t2_pil = t2_pil.filter(ImageFilter.GaussianBlur(1))

    return t1_pil, t2_pil


def generate_all_samples():
    """Generate all 4 synthetic pairs and persist to backend and frontend samples directories."""
    BACKEND_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    if FRONTEND_SAMPLES_DIR.exists():
        FRONTEND_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    pairs = [
        ("forest", make_forest_pair),
        ("urban", make_urban_pair),
        ("coast", make_coastal_pair),
        ("flood", make_flood_pair),
    ]

    for sample_id, generator_fn in pairs:
        t1_img, t2_img = generator_fn()

        backend_t1 = BACKEND_SAMPLES_DIR / f"{sample_id}_t1.jpg"
        backend_t2 = BACKEND_SAMPLES_DIR / f"{sample_id}_t2.jpg"

        t1_img.save(backend_t1, "JPEG", quality=90)
        t2_img.save(backend_t2, "JPEG", quality=90)
        print(f"Generated backend sample: {backend_t1.name}, {backend_t2.name}")

        if FRONTEND_SAMPLES_DIR.exists():
            front_t1 = FRONTEND_SAMPLES_DIR / f"{sample_id}_t1.jpg"
            front_t2 = FRONTEND_SAMPLES_DIR / f"{sample_id}_t2.jpg"
            t1_img.save(front_t1, "JPEG", quality=90)
            t2_img.save(front_t2, "JPEG", quality=90)

    print("Synthetic sample generation complete.")


if __name__ == "__main__":
    generate_all_samples()
