type AiImageOptions = {
  width?: number;
  height?: number;
  seed?: string | number;
};

export function aiImageUrl(prompt: string, options: AiImageOptions = {}) {
  const width = options.width ?? 800;
  const height = options.height ?? 600;
  const seed = options.seed ?? prompt;

  // Thay thế AI generator (quá chậm) bằng Picsum (nhanh, ảnh random đẹp theo seed)
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${width}/${height}`;
}
