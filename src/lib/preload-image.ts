/**
 * Function to preload an image into the browser cache.
 * @param src source of the image.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve();
    // We also want to resolve in case of an error.
    image.onerror = () => resolve();
    image.src = src;
  });
}
