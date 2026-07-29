import * as artists from "./artists";
import * as places from "./places";
import * as graph from "./graph";
import * as timeline from "./timeline";
import * as genres from "./genres";
import * as sources from "./sources";
import * as culture from "./culture";
import * as ai from "./ai";

export { API_URL } from "./client";

/** Flat call surface (`api.artists()`, `api.genre(id)`, ...) — same shape as before the split. */
export const api = {
  ...artists,
  ...places,
  ...graph,
  ...timeline,
  ...genres,
  ...sources,
  ...culture,
  ...ai,
};
