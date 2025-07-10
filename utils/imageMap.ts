// utils/imageMap.ts
const localImageMap: Record<string, any> = {
  'bghome.png': require('../assets/images/bghome.png'),
};

export function getImageSource(imageUrl?: string) {
  if (!imageUrl) return undefined;

  if (imageUrl.startsWith('http')) {
    return { uri: imageUrl };
  }

  return localImageMap[imageUrl];
}

export default getImageSource;