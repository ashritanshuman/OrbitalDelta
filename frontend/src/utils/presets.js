/**
 * Utilities for fetching the preset benchmark dataset manifest and
 * converting remote preset image URLs into standard browser File objects.
 */

export async function fetchManifest() {
  const res = await fetch('/samples/manifest.json', { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Failed to load preset manifest (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Fetches the before and after images for a preset item and converts them into real File objects.
 * @param {Object} preset - Manifest item with id, label, before, after
 * @returns {Promise<{beforeFile: File, afterFile: File}>}
 */
export async function presetToFiles(preset) {
  if (!preset || !preset.before || !preset.after) {
    throw new Error(`Invalid preset item: ${JSON.stringify(preset)}`);
  }

  const [bRes, aRes] = await Promise.all([
    fetch(preset.before),
    fetch(preset.after),
  ]);

  if (!bRes.ok) {
    throw new Error(`Preset images not found: ${preset.id} (T1/before 404)`);
  }
  if (!aRes.ok) {
    throw new Error(`Preset images not found: ${preset.id} (T2/after 404)`);
  }

  const [bBlob, aBlob] = await Promise.all([
    bRes.blob(),
    aRes.blob(),
  ]);

  const bType = bBlob.type && bBlob.type.startsWith('image/') ? bBlob.type : 'image/jpeg';
  const aType = aBlob.type && aBlob.type.startsWith('image/') ? aBlob.type : 'image/jpeg';

  const bExt = bType.includes('png') ? 'png' : 'jpg';
  const aExt = aType.includes('png') ? 'png' : 'jpg';

  const beforeFile = new File([bBlob], `${preset.id}_before.${bExt}`, { type: bType });
  const afterFile = new File([aBlob], `${preset.id}_after.${aExt}`, { type: aType });

  return { beforeFile, afterFile };
}
