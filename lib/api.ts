// Get API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic API client for making HTTP requests
 */
export const apiClient = {
  /**
   * Generic fetch method with error handling
   */
  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  /**
   * GET request wrapper
   */
  async get<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.fetch<T>(endpoint, { ...options, method: "GET" });
  },

  /**
   * POST request wrapper
   */
  async post<T>(
    endpoint: string,
    body: any,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Upload file wrapper
   */
  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        method: "POST",
        body: formData,
        // Don't set Content-Type header as the browser will set it with the boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error("File upload failed:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

/**
 * API endpoints for specific features
 */
export const api = {
  // Health check
  checkHealth: async () => {
    return apiClient.get<{ status: string; message: string }>("/api/health");
  },

  // Slide upload and processing
  uploadSlide: async (formData: FormData) => {
    return apiClient.uploadFile("/api/slides/upload", formData);
  },

  // Content processing
  processContent: async (contentId: string) => {
    return apiClient.post("/api/content/process", { contentId });
  },

  // Quiz generation and retrieval
  generateQuiz: async (contentId: string, options: any = {}) => {
    return apiClient.post("/api/quizzes/generate", { contentId, ...options });
  },

  getQuiz: async (quizId: string) => {
    return apiClient.get(`/api/quizzes/${quizId}`);
  },

  // Content classification
  updateClassification: async (contentId: string, classification: any) => {
    return apiClient.post(`/api/content/${contentId}/classify`, {
      classification,
    });
  },

  // Chat with content
  chatWithContent: async (contentId: string, message: string) => {
    return apiClient.post("/api/chat", { contentId, message });
  },
};

/**
 * Hook for handling API status
 * Uses the UI components directly instead of a toast library
 */
export function useApiStatus() {
  const showError = (message: string) => {
    console.error(message || "An error occurred. Please try again.");
    // The actual toast will be handled by components using the ErrorMessage component
  };

  const showSuccess = (message: string) => {
    console.log(message);
    // The actual toast will be handled by components using their own toast system
  };

  return { showError, showSuccess };
}
