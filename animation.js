// Seven distinct poses: the eighth is nearly identical to the first and would
// hold the same foot position twice at the loop boundary. Animation follows
// distance, so its cadence tracks the game's actual forward speed.
export const RUN_SEQUENCE = [1, 2, 3, 4, 5, 6, 7];
export const STRIDE_LENGTH = 205;
export function runningPose(distance) {
  const phase = ((distance / STRIDE_LENGTH) % 1 + 1) % 1;
  const position = phase * RUN_SEQUENCE.length;
  const index = Math.floor(position);
  const progress = position - index;
  // Keep each original pose readable; blend only at the end of its interval.
  const blend = Math.max(0, (progress - 0.75) / 0.25);
  return { current: RUN_SEQUENCE[index], next: RUN_SEQUENCE[(index + 1) % RUN_SEQUENCE.length], blend: blend * blend * (3 - 2 * blend) };
}
