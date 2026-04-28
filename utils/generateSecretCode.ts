export function generateSecretCode(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
}

export function generateDistinctSecretCodes(): { 1: string; 2: string } {
  const first = generateSecretCode();
  let second = generateSecretCode();
  while (second === first) {
    second = generateSecretCode();
  }
  return { 1: first, 2: second };
}
