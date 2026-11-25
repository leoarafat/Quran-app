import { describe, expect, it } from "vitest";
import { MENU } from "@/components/more/MoreMenu";
import { FEATURE_GROUPS } from "@/lib/features";

describe("the menu of every feature", () => {
  const listed = MENU.flatMap((g) => g.tiles.map((t) => t.href));
  it("loses no feature in the new grouping and shows none twice", () => {
    for (const feature of FEATURE_GROUPS.flatMap((g) => g.items)) expect(listed.filter((href) => href === feature.href), feature.title).toHaveLength(1);
  });
  it("keeps the app's own pages", () => expect(listed).toEqual(expect.arrayContaining(["/settings/", "/offline/", "/about/", "/"])));
});
