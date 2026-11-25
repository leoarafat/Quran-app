import { describe, expect, it } from "vitest";
import { BOOT_SCRIPT } from "@/components/SettingsBootScript";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { isActivePath } from "@/lib/nav";
import { applySettings, DEFAULT_SETTINGS, parseSettings } from "@/lib/settings";

describe("Bangla digits", () => {
  it("converts both ways", () => {
    expect(toBnDigits("2:255")).toBe("২:২৫৫");
    expect(toAsciiDigits("২:২৫৫")).toBe("2:255");
    expect(toBnDigits(1234567890)).toBe("১২৩৪৫৬৭৮৯০");
  });
});

describe("active nav item", () => {
  it("matches sections without matching look-alike paths", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/", "/quran/")).toBe(false);
    expect(isActivePath("/quran/", "/quran/2/")).toBe(true);
    expect(isActivePath("/quran/", "/quran")).toBe(true);
    expect(isActivePath("/quran/", "/quran-index/")).toBe(false);
  });
});

describe("settings", () => {
  const bad = [null, "", "not json", "null", "42", "[]", '{"theme":"neon","arScale":"big","bnScale":null}'];

  it("falls back to defaults on corrupt data", () => {
    for (const raw of bad) expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps the theme chosen before the redesign", () => {
    expect(parseSettings('{"theme":"dark"}').theme).toBe("night");
    expect(parseSettings('{"theme":"light"}').theme).toBe("paper");
    expect(parseSettings('{"theme":"sepia"}').theme).toBe("sepia");
  });

  it("follows the phone only when asked to", () => {
    const root = () => ({ dataset: {} as Record<string, string>, style: { setProperty: () => {} } }) as unknown as HTMLElement;
    const apply = (raw: string, dark: boolean) => { const r = root(); applySettings(parseSettings(raw), r, dark); return r.dataset.theme; };
    expect([apply('{"theme":"system"}', false), apply('{"theme":"system"}', true), apply('{"theme":"sepia"}', true)]).toEqual(["paper", "night", "sepia"]);
    for (const dark of [true, false]) {
      const booted = { dataset: {} as Record<string, string>, style: { setProperty: () => {} } };
      new Function("localStorage", "document", "matchMedia", BOOT_SCRIPT)({ getItem: () => '{"theme":"system","contrast":true}' }, { documentElement: booted }, () => ({ matches: dark }));
      expect(booted.dataset).toMatchObject({ theme: dark ? "night" : "paper", contrast: "true" });
    }
  });

  it("clamps sizes", () => {
    expect(parseSettings('{"arScale":99,"bnScale":0}')).toMatchObject({ arScale: 2, bnScale: 0.8 });
  });

  function fakeRoot() {
    const style: Record<string, string> = {};
    const root = { dataset: {} as Record<string, string>, style: { setProperty: (k: string, v: string) => { style[k] = v; } } };
    return { root, style };
  }

  it("boot script applies the same result as the app code", () => {
    const inputs = [
      '{"theme":"dark","easyMode":true,"arScale":1.4,"bnScale":1.2}',
      '{"theme":"sepia","easyMode":"yes","arScale":50}',
      '{"theme":"neon"}',
      '{"theme":"light"}',
      '{"theme":"amoled"}',
      '{"theme":"constructor"}',
    ];
    for (const raw of inputs) {
      const a = fakeRoot();
      applySettings(parseSettings(raw), a.root as unknown as HTMLElement);
      const b = fakeRoot();
      new Function("localStorage", "document", BOOT_SCRIPT)({ getItem: () => raw }, { documentElement: b.root });
      expect({ d: b.root.dataset, s: b.style }).toEqual({ d: a.root.dataset, s: a.style });
    }
  });

  it("boot script never throws when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error("blocked"); } };
    expect(() => new Function("localStorage", "document", BOOT_SCRIPT)(blocked, {})).not.toThrow();
  });
});
