export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  symbol: /[^a-zA-Z0-9]/,
};

export interface PasswordCheck {
  label: string;
  key: string;
  met: boolean;
}

export function checkPassword(password: string): PasswordCheck[] {
  return [
    { label: "Mínimo 8 caracteres", key: "min", met: password.length >= PASSWORD_RULES.minLength },
    { label: "Una mayúscula", key: "upper", met: PASSWORD_RULES.uppercase.test(password) },
    { label: "Una minúscula", key: "lower", met: PASSWORD_RULES.lowercase.test(password) },
    { label: "Un número", key: "digit", met: PASSWORD_RULES.digit.test(password) },
    { label: "Un símbolo", key: "symbol", met: PASSWORD_RULES.symbol.test(password) },
  ];
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const checks = checkPassword(password);
  const failed = checks.filter((c) => !c.met);
  return {
    valid: failed.length === 0,
    errors: failed.map((c) => c.label),
  };
}
