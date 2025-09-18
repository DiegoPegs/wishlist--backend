import { Types } from 'mongoose';

/**
 * Type guard para verificar se um valor é um ObjectId do MongoDB
 */
export function isObjectId(value: unknown): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Type guard para verificar se um valor pode ser convertido para string
 */
export function isStringConvertible(
  value: unknown,
): value is { toString(): string } {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'toString' in value
  );
}

/**
 * Converte um valor para string de forma segura
 * @param value - Valor a ser convertido
 * @returns String convertida ou string vazia se não for possível converter
 */
export function safeToString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (isObjectId(value)) {
    return value.toString();
  }

  if (isStringConvertible(value)) {
    return value.toString();
  }

  return '';
}

/**
 * Converte um array de valores para array de strings de forma segura
 * @param values - Array de valores a serem convertidos
 * @returns Array de strings convertidas
 */
export function safeToStringArray(values: unknown[]): string[] {
  return values.map(safeToString).filter((str) => str !== '');
}
