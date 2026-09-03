import { env } from '../config/env';

export interface BrandingInput {
  title: string;
  category: string;
  village: string;
  district: string;
  keyFeatures?: string;
  rawStory?: string;
}

export interface BrandingOutput {
  brandNameIdeas: string[];
  productDescription: string;
  producerStory: string;
  socialCaptions: string[];
  packagingCopy: string;
  marathiSummary: string;
}

export const generateBrandingContent = async (input: BrandingInput): Promise<BrandingOutput> => {
  const { title, category, village, district, keyFeatures, rawStory } = input;

  // Fallback / Offline smart contextual AI engine
  const generatedNames = [
    `${district} Heritage ${title}`,
    `Sahyadri Pure ${title}`,
    `Gramin Handcrafted ${title}`,
    `Konkan Organic ${title}`,
  ];

  const productDescription = `Experience the authentic taste and craftsmanship of Maharashtra with our ${title}. Hand-prepared in ${village}, ${district} using traditional recipes and natural ingredients. Every unit is produced in small batches by local artisans and farmer collectives.`;

  const producerStory = rawStory && rawStory.trim().length > 10
    ? rawStory
    : `Brought to you by the rural enterprise group in ${village}, ${district}. By choosing this product, you directly support local livelihoods, women self-help initiatives, and centuries-old Maharashtrian cultural heritage.`;

  const socialCaptions = [
    `🌿 Authentic ${title} straight from ${village}, ${district}! Taste the pure rural heritage of Maharashtra. #RuralRoute #VocalForLocal #MaharashtraArtisans #${district}Special`,
    `✨ Handcrafted with care by rural entrepreneurs in ${district}. Every purchase empowers smallholder producers! Discover on RuralRoute today. #MakeInMaharashtra #RuralStartup`,
  ];

  const packagingCopy = `Store in a cool, dry place away from direct sunlight. Batch certified by RuralRoute Rural Trust Network. Manufactured in ${village}, ${district}, Maharashtra.`;

  const marathiSummary = `महाराष्ट्र राज्यातील ${district} जिल्ह्यातील ${village} गावातील ग्रामीण उद्योजकांनी बनवलेले अस्सल ${title}. गुणवत्तेची खात्री आणि थेट खरेदी.`;

  return {
    brandNameIdeas: generatedNames,
    productDescription,
    producerStory,
    socialCaptions,
    packagingCopy,
    marathiSummary,
  };
};
