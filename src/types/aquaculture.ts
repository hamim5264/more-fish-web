export type AquacultureFlow = 'fish' | 'pharma';

export type AuthFlow = AquacultureFlow | 'cattle' | 'poultry';

export const isAquacultureFlow = (flow: string): flow is AquacultureFlow =>
  flow === 'fish' || flow === 'pharma';
