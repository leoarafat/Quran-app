const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** 255 -> "২৫৫" */
export function toBnDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** "২৫৫" -> "255". Other characters are left unchanged. */
export function toAsciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}
