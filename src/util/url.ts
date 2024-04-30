export function generateTmdbImageUrl(imageName: string) {
  return new URL(`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}/${imageName}`);
}