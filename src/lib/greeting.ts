/** A greeting for the visitor's own time of day. */
export function greetingFor(hour: number): string {
  if (hour >= 4 && hour < 12) return "শুভ সকাল";
  if (hour >= 12 && hour < 15) return "শুভ দুপুর";
  if (hour >= 15 && hour < 18) return "শুভ অপরাহ্ন";
  if (hour >= 18 && hour < 20) return "শুভ সন্ধ্যা";
  return "শুভ রাত্রি";
}
