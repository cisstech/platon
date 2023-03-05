interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  return value.trim();
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  if (value == null)
    return true;
  value = (value + '').toLowerCase();
  return value === '' || value === "true" || value === "1" ? true : false;
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value ?? String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default as number;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (opts.max && newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}


export function toArray<T>(value: T | T[]): T[] {
  if (!value)
    return []

  return Array.isArray(value) ? value : [value]
}
