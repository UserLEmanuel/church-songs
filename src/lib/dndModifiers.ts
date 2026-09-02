import type { Modifier } from '@dnd-kit/core';

/** Blocheaza tragerea pe verticala: lista de pagini nu are sens sa se miste lateral. */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});
