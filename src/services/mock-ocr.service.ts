import { OcrRequestOptions, ProcessedOcrResult, OcrResult } from './ocr.service';

export class MockOcrService {
  private processOcrResult(result: OcrResult): ProcessedOcrResult {
    const boxes = result.text.boxes.map((coordinates, index) => ({
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResult: OcrResult = {
      text: {
        boxes: [
          [[27, 29], [54, 29], [54, 58], [27, 58]],
          [[79, 30], [99, 30], [99, 56], [79, 56]],
          [[124, 29], [151, 29], [151, 58], [124, 58]],
        ],
        scores: [0.9999561309814453, 0.9997976422309875, 0.9993817806243896],
        texts: ['测', '试', '文'],
      },
    };

    return this.processOcrResult(mockResult);
  }

  async ocrFromUrl(
    imageUrl: string,
    options: Partial<OcrRequestOptions> = {}
  ): Promise<ProcessedOcrResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResult: OcrResult = {
      text: {
        boxes: [
          [[27, 29], [54, 29], [54, 58], [27, 58]],
          [[79, 30], [99, 30], [99, 56], [79, 56]],
        ],
        scores: [0.9999561309814453, 0.9997976422309875],
        texts: ['网', '址'],
      },
    };

    return this.processOcrResult(mockResult);
  }
}
