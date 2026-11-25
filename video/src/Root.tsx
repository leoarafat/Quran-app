import { Composition, Still } from "remotion";
import eid from "./data/timeline.eid.json";
import janaza from "./data/timeline.janaza.json";
import { Poster } from "./Poster";
import { H, W } from "./theme";
import type { Lesson } from "./types";
import { Video } from "./Video";

export const LESSONS = {
  eid: { ...(eid as unknown as Lesson), name: "দুই ঈদের নামাজ", marks: 3 },
  janaza: { ...(janaza as unknown as Lesson), name: "জানাজার নামাজ", marks: 4 },
};

export const Root = () => (
  <>
    {(["eid", "janaza"] as const).map((id) => (
      <Composition key={id} id={id} component={Video} defaultProps={{ id }} durationInFrames={LESSONS[id].total} fps={30} width={W} height={H} />
    ))}
    {(["eid", "janaza"] as const).map((id) => (
      <Still key={id} id={`poster-${id}`} component={Poster} defaultProps={{ id }} width={W} height={H} />
    ))}
  </>
);
