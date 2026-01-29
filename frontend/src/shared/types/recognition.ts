export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface Recognition {
  id: number;
  imagePath: string;
  cowsCount: number;
  result: Detection[];
  createdAt: string;
}

export interface DetectionResult {
  id: number;
  imagePath: string;
  cowsCount: number;
  result: Detection[];
  createdAt: string;
}
