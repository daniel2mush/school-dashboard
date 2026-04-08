/** Browser-safe password for admin-provisioned accounts (min 8 chars). */
export function generateSecurePassword(length = 16): string {
  const chars =
    "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  let s = "";
  for (let i = 0; i < length; i++) {
    s += chars[buf[i]! % chars.length];
  }
  return s;
}
