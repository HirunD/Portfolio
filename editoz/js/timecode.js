const two = (n) => String(n).padStart(2, '0');

// frames → HH:MM:SS:FF
export function formatTimecode(frames, fps) {
  const s = Math.floor(frames / fps);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frames % fps].map(two).join(':');
}
