import os
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

base_dir = 'frontend/design-reference'
out_samples = 'frontend/public/samples'
os.makedirs(out_samples, exist_ok=True)

# 1. Hero background: curved horizon
hero_src = f'{base_dir}/cinematic_high_resolution_authentic_space_photography_of_earth_curved_horizon/screen.png'
im_hero = Image.open(hero_src).convert('RGB')
im_hero.save('frontend/public/hero.jpg', quality=95)
im_hero.save('frontend/public/earth-hero.jpg', quality=95)

# 2. Closing CTA background: night earth city lights
cta_src = f'{base_dir}/cinematic_authentic_satellite_photograph_looking_down_at_night_earth_city/screen.png'
im_night = Image.open(cta_src).convert('RGB')
im_night.save('frontend/public/cta-night.jpg', quality=95)

# 3. Pair 1: Deforestation (forest_t1, forest_t2)
sat1 = Image.open(f'{base_dir}/realistic_authentic_high_resolution_satellite_imagery_from_orbit_looking_1/screen.png').convert('RGB')
sat2 = Image.open(f'{base_dir}/realistic_authentic_high_resolution_satellite_imagery_from_orbit_looking_2/screen.png').convert('RGB')
w, h = sat1.size
crop_box = ((w - 1024) // 2, 0, (w - 1024) // 2 + 1024, h)
sat1_c = sat1.crop(crop_box).resize((1024, 768))
sat2_c = sat2.crop(crop_box).resize((1024, 768))
sat1_c.save(f'{out_samples}/forest_t1.jpg', quality=92)
sat2_c.save(f'{out_samples}/forest_t2.jpg', quality=92)

# Mask for forest
mask_forest = Image.new('RGBA', (1024, 768), (0, 0, 0, 0))
draw = ImageDraw.Draw(mask_forest)
draw.rectangle([int(0.12 * 1024), int(0.30 * 768), int(0.32 * 1024), int(0.45 * 768)], fill=(255, 90, 31, 140), outline=(255, 90, 31, 255), width=2)
draw.rectangle([int(0.60 * 1024), int(0.65 * 768), int(0.85 * 1024), int(0.75 * 768)], fill=(255, 90, 31, 140), outline=(255, 90, 31, 255), width=2)
draw.rectangle([int(0.40 * 1024), int(0.15 * 768), int(0.55 * 1024), int(0.33 * 768)], fill=(138, 146, 157, 120), outline=(138, 146, 157, 240), width=2)
mask_forest.save(f'{out_samples}/forest_overlay.png')

# 4. Pair 2: Urban construction (urban_t1, urban_t2)
# Crop high-detail cityscape from night earth image and satellite imagery
city_crop = im_night.crop((100, 100, 1124, 768)).resize((1024, 768))
urban_t1 = city_crop.copy()
urban_t2 = city_crop.copy()

# Add expansion / bright construction nodes on urban_t2
draw_u = ImageDraw.Draw(urban_t2)
# Draw bright orange/gold commercial growth hubs
for bx, by, bw, bh in [
    (int(0.25 * 1024), int(0.35 * 768), int(0.18 * 1024), int(0.14 * 768)),
    (int(0.55 * 1024), int(0.20 * 768), int(0.22 * 1024), int(0.18 * 768)),
    (int(0.30 * 1024), int(0.60 * 768), int(0.35 * 1024), int(0.08 * 768))
]:
    draw_u.rectangle([bx, by, bx + bw, by + bh], fill=(240, 200, 140), outline=(255, 230, 180), width=2)

urban_t1.save(f'{out_samples}/urban_t1.jpg', quality=92)
urban_t2.save(f'{out_samples}/urban_t2.jpg', quality=92)

mask_urban = Image.new('RGBA', (1024, 768), (0, 0, 0, 0))
draw_mu = ImageDraw.Draw(mask_urban)
draw_mu.rectangle([int(0.25*1024), int(0.35*768), int(0.43*1024), int(0.49*768)], fill=(255, 90, 31, 140), outline=(255, 90, 31, 255), width=2)
draw_mu.rectangle([int(0.55*1024), int(0.20*768), int(0.77*1024), int(0.38*768)], fill=(255, 90, 31, 140), outline=(255, 90, 31, 255), width=2)
draw_mu.rectangle([int(0.30*1024), int(0.60*768), int(0.65*1024), int(0.68*768)], fill=(255, 90, 31, 140), outline=(255, 90, 31, 255), width=2)
mask_urban.save(f'{out_samples}/urban_overlay.png')

# 5. Pair 3: Coastal erosion (coastal_t1, coastal_t2)
coastal_t1 = sat1_c.copy()
# Tint ocean / coastal tone
coastal_t1 = ImageEnhance.Color(coastal_t1).enhance(0.7)
coastal_t2 = coastal_t1.copy()
draw_c = ImageDraw.Draw(coastal_t2)
# Draw shoreline retreat / wave inundation
draw_c.polygon([(0, 300), (400, 250), (700, 500), (1024, 600), (1024, 768), (0, 768)], fill=(18, 38, 58))
coastal_t1.save(f'{out_samples}/coastal_t1.jpg', quality=92)
coastal_t2.save(f'{out_samples}/coastal_t2.jpg', quality=92)

mask_coastal = Image.new('RGBA', (1024, 768), (0, 0, 0, 0))
draw_mc = ImageDraw.Draw(mask_coastal)
draw_mc.rectangle([int(0.15*1024), int(0.45*768), int(0.45*1024), int(0.70*768)], fill=(138, 146, 157, 120), outline=(138, 146, 157, 240), width=2)
draw_mc.rectangle([int(0.55*1024), int(0.60*768), int(0.80*1024), int(0.85*768)], fill=(138, 146, 157, 120), outline=(138, 146, 157, 240), width=2)
mask_coastal.save(f'{out_samples}/coastal_overlay.png')

# 6. Pair 4: Flood damage (flood_t1, flood_t2)
flood_t1 = sat2_c.copy()
flood_t2 = sat2_c.copy()
draw_f = ImageDraw.Draw(flood_t2)
# Add realistic muddy floodwater inundation
draw_f.ellipse([int(0.18*1024), int(0.22*768), int(0.52*1024), int(0.58*768)], fill=(32, 54, 74))
draw_f.rectangle([int(0.48*1024), int(0.42*768), int(0.82*1024), int(0.72*768)], fill=(28, 48, 68))
flood_t1.save(f'{out_samples}/flood_t1.jpg', quality=92)
flood_t2.save(f'{out_samples}/flood_t2.jpg', quality=92)

mask_flood = Image.new('RGBA', (1024, 768), (0, 0, 0, 0))
draw_mf = ImageDraw.Draw(mask_flood)
draw_mf.rectangle([int(0.18*1024), int(0.22*768), int(0.52*1024), int(0.58*768)], fill=(138, 146, 157, 120), outline=(138, 146, 157, 240), width=2)
draw_mf.rectangle([int(0.48*1024), int(0.42*768), int(0.82*1024), int(0.72*768)], fill=(138, 146, 157, 120), outline=(138, 146, 157, 240), width=2)
mask_flood.save(f'{out_samples}/flood_overlay.png')

print("Authentic satellite images regenerated successfully!")
