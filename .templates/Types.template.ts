/**
 * Type definitions for feature/module
 */

export interface TypeName {
  property: string;
  optionalProperty?: number;
  nestedObject: {
    nestedProperty: boolean;
  };
}

export type TypeNameUnion =
  | 'option1'
  | 'option2'
  | 'option3';

export interface RequestType {
  id: string;
  data: TypeName;
}

export interface ResponseType {
  success: boolean;
  message: string;
  data?: TypeName;
}

// Export constants
export const CONSTANT_NAME = 'value';