import { apiClient } from './apiService';

/**
 * ServiceName Service
 *
 * Description of what this service handles.
 */
export class ServiceNameService {
  /**
   * Method description
   *
   * @param {Type} paramName - Parameter description
   * @returns {Promise<Type>} Return description
   */
  static async method(param: Type): Promise<ReturnType> {
    try {
      const response = await apiClient.post<ResponseType>('/endpoint', param);
      return response.data;
    } catch (error) {
      console.error('ServiceName.method error:', error);
      throw error;
    }
  }

  /**
   * Another method description
   */
  static async anotherMethod(): Promise<void> {
    // Implementation
  }
}

// Export types
export type ServiceNameParams = {
  param: Type;
};

export type ServiceNameResponse = {
  data: Type;
};