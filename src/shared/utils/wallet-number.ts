export function generateWalletNumber() {
  const random = Math.floor(Math.random() * 1_000_000_0000) // 10 digits
    .toString()
    .padStart(10, '0');

  return `01${random}`;
}
