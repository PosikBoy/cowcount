import { DetectionResult, Recognition } from "../types/recognition";
import apiClient, { uploadFile } from "./axios.instance";
import { API_BASE_URL, API_ENDPOINTS } from "./config";

export const recognitionApi = {
  async uploadImage(file: File): Promise<DetectionResult> {
    return uploadFile<DetectionResult>(API_ENDPOINTS.DETECT, file);
  },

  async getHistory(): Promise<Recognition[]> {
    const response = await apiClient.get<Recognition[]>(
      API_ENDPOINTS.DETECT_HISTORY,
    );
    return response.data;
  },

  async getById(id: string | number): Promise<Recognition> {
    const response = await apiClient.get<Recognition>(
      API_ENDPOINTS.DETECT_BY_ID(Number(id)),
    );
    return response.data;
  },

  async deleteById(id: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.DETECT_DELETE(Number(id)));
  },

  getImageUrl(filename: string): string {
    return `${API_BASE_URL}${API_ENDPOINTS.UPLOADS(filename)}`;
  },

  async analyzeVideo(
    file: File,
    sampleInterval: number = 1.0,
    onUploadProgress?: (progressEvent: any) => void,
  ): Promise<any> {
    return uploadFile(
      `${API_ENDPOINTS.VIDEO_ANALYZE}?sample_interval=${sampleInterval}`,
      file,
      undefined,
      onUploadProgress,
    );
  },

  getVideoUrl(filename: string): string {
    return `${API_BASE_URL}${API_ENDPOINTS.VIDEO_STREAM(filename)}`;
  },

  async getStats(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.DETECT_STATS);
    return response.data;
  },
};
