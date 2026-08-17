export function isCamelCase(str: string): boolean {
  if (str.startsWith('_')) return true;
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

export function validateCamelCaseObject(obj: any, path = ''): string[] {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') return errors;

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      errors.push(...validateCamelCaseObject(item, `${path}[${idx}]`));
    });
    return errors;
  }

  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!isCamelCase(key)) {
      errors.push(`Key '${key}' at path '${currentPath}' is NOT camelCase`);
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      errors.push(...validateCamelCaseObject(obj[key], currentPath));
    }
  }

  return errors;
}
