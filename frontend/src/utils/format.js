export function formatPercent(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatConfidence(value) {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  const num = Number(value);
  const normalized = num <= 1.0 ? num * 100 : num;
  return `${Math.round(normalized)}%`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatAreaKm2(percent, baseArea = 32.5) {
  if (percent === undefined || percent === null) return '0.00 KM²';
  const area = (Number(percent) / 100) * baseArea;
  return `${area.toFixed(2)} KM²`;
}
