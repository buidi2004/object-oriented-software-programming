export interface PasswordStrength {
  strength: 1 | 2 | 3;
  label: 'Yếu' | 'Trung bình' | 'Mạnh';
  barColor: string;
  textColor: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { strength: 1, label: 'Yếu', barColor: 'bg-slate-200', textColor: 'text-slate-600' };
  }
  if (password.length < 6) {
    return { strength: 1, label: 'Yếu', barColor: 'bg-red-500', textColor: 'text-red-600' };
  }
  if (password.length < 8) {
    return { strength: 2, label: 'Trung bình', barColor: 'bg-yellow-500', textColor: 'text-yellow-600' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (score >= 3 && password.length >= 10) {
    return { strength: 3, label: 'Mạnh', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }
  if (score >= 2) {
    return { strength: 2, label: 'Trung bình', barColor: 'bg-yellow-500', textColor: 'text-yellow-600' };
  }
  return { strength: 1, label: 'Yếu', barColor: 'bg-red-500', textColor: 'text-red-600' };
}
