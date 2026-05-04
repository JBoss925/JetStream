import type { CSSProperties } from "react";

export type WeatherCssProperties = CSSProperties & Record<`--${string}`, string | number>;
