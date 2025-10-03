export interface ProjectDetails {
  address: string;
  projectTypes: string[];
  images: {
    inlineData: {
      data: string; // base64 string
      mimeType: string;
    };
  }[];
  additionalNotes?: string;
  useWebSearch?: boolean;
}

export enum EstimateTier {
  Good = 'טוב',
  Better = 'טוב יותר',
  Best = 'הכי טוב',
}

export interface Material {
  name: string;
  avgPrice: number; // In USD
}

export interface EstimateOption {
  tier: EstimateTier;
  name: string;
  price: number; // This is the final suggested sale price to the customer, in USD
  description: string;
  materials: Material[];
  totalMaterialCost: number; // In USD
}

export interface WebImage {
  imageUrl: string;
  sourceDomain: string;
}

export interface Estimate {
  options: EstimateOption[];
  summary: string;
  measurements: {
    area: number;
    perimeter: number;
  };
  webImages?: WebImage[];
}