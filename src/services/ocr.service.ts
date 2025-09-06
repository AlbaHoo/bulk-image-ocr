export interface OcrRequestOptions {
  lang?: string;
  cls?: boolean;
  det?: boolean;
  rec?: boolean;
  bin?: boolean;
  inv?: boolean;
  alpha_color?: string;
  slice?: Record<string, any>;
}

export interface OcrBox {
  coordinates: number[][];
  score: number;
  text: string;
}

export interface OcrResult {
  text: {
    boxes: number[][][];
    scores: number[];
    texts: string[];
  };
}

export interface ProcessedOcrResult {
  boxes: OcrBox[];
  rawResult: OcrResult;
}

export class OcrService {
  private baseUrl = 'http://image.tenty.co/ocr';

  private getDefaultOptions(): OcrRequestOptions {
    return {
      lang: '',
      cls: true,
      det: true,
      rec: true,
      bin: false,
      inv: false,
      alpha_color: '(255, 255, 255)',
      slice: {},
    };
  }

  private processOcrResult(result: OcrResult): ProcessedOcrResult {
    const boxes: OcrBox[] = result.text.boxes.map((coordinates, index) => ({
      coordinates,
      score: result.text.scores[index],
      text: result.text.texts[index],
    }));

    return {
      boxes,
      rawResult: result,
    };
  }

  async ocrFromBase64(
    imageBase64: string,
    options: Partial<OcrRequestOptions> = {}
  ): Promise<ProcessedOcrResult> {
    const requestOptions = { ...this.getDefaultOptions(), ...options };

    const response = await fetch(`${this.baseUrl}/base64`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        ...requestOptions,
      }),
    });

    if (!response.ok) {
      throw new Error(`OCR request failed: ${response.statusText}`);
    }

    const result: OcrResult = await response.json();
    return this.processOcrResult(result);
  }

  async ocrFromUrl(
    imageUrl: string,
    options: Partial<OcrRequestOptions> = {}
  ): Promise<ProcessedOcrResult> {
    const requestOptions = { ...this.getDefaultOptions(), ...options };

    const response = await fetch(`${this.baseUrl}/url`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        ...requestOptions,
      }),
    });

    if (!response.ok) {
      throw new Error(`OCR request failed: ${response.statusText}`);
    }

    const result: OcrResult = await response.json();
    return this.processOcrResult(result);
  }
}
