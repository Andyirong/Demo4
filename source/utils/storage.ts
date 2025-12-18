// 本地存储工具类
export class LocalStorage {
  // 保存数据
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  // 获取数据
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get from localStorage:`, error);
      return defaultValue;
    }
  }

  // 删除数据
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
    }
  }

  // 清空所有数据
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Failed to clear localStorage:`, error);
    }
  }

  // 检查是否存在
  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}