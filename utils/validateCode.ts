export type CodeValidation =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'mismatch' | 'locked'; message: string };

export function validateCode(
  input: string,
  secret: string,
  now: number,
  lockUntil: number,
): CodeValidation {
  if (now < lockUntil) {
    const remaining = Math.ceil((lockUntil - now) / 1000);
    return {
      ok: false,
      reason: 'locked',
      message: `Kilitli. ${remaining} saniye sonra tekrar dene.`,
    };
  }
  if (!input.trim()) {
    return { ok: false, reason: 'empty', message: 'Şifre boş olamaz.' };
  }
  if (input !== secret) {
    return { ok: false, reason: 'mismatch', message: 'Şifre yanlış.' };
  }
  return { ok: true };
}
