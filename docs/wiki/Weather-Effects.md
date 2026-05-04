# Weather Effects

Weather effects are implemented in CSS in `apps/web/src/styles.css`. The dashboard chooses weather-specific CSS classes from `WeatherDashboard.tsx`.

## Condition Classes

The root dashboard section receives:

```text
condition-{family}
condition-day | condition-night
```

Examples:

- `condition-clear condition-day`
- `condition-drizzle condition-night`
- `condition-snow condition-day`

These classes drive hero color variables and weather effect layers.

## Hero Isolation From Theme

The hero uses local custom properties such as:

- `--condition-a`
- `--condition-b`
- `--condition-c`
- `--hero-text`
- `--hero-muted`
- `--hero-accent`
- `--hero-overlay`
- `--hero-sun`
- `--hero-sun-glow`

This keeps the hero visually stable when the page switches between light and dark themes.

## Shared Scene Structure

The hero scene contains:

- Sky disc for sun/moon treatment.
- Three staged clouds.
- A `rain-field` overlay used by precipitation-like effects.

The `rain-field` is decorative and hidden from assistive technology.

## Rain

Rain uses multiple `repeating-linear-gradient` layers with fast background-position animation. Rain is dense and angled.

## Drizzle

Drizzle uses short dash-like radial gradients rather than full line stripes. It is:

- Vertical.
- Less dense than rain.
- Slower-looping than rain.
- Softer and less opaque than heavy rain.

Drizzle intentionally avoids strong horizontal movement so it reads as light drizzle rather than a downpour.

## Snow

Snow uses star-shaped SVG data URI tiles. The snow layer is split across:

- `.condition-snow .rain-field`
- `.condition-snow .rain-field::before`
- `.condition-snow .rain-field::after`

Each layer has:

- Different flake size.
- Different tile size.
- Different fall duration.
- Different eased horizontal drift.
- Multiple flakes within each tile to reduce visible grid patterns.

Large flakes fall fastest. Smaller flakes fall slower to imply distance.

## Precipitation Instrument Effect

The precipitation card does not reuse the hero effect. It renders its own rain-only drop field based on current precipitation probability, falling back to hourly probability when current probability is absent.

The number of drops, positions, starting heights, travel distances, delay, duration, opacity, and height are generated from deterministic pseudo-random values so the scene is stable but less repetitive.

## Forecast And Instrument Icons

Weather-family icons come from Lucide React where possible. The app uses icons for:

- Clear
- Clouds
- Fog
- Drizzle
- Rain
- Snow
- Storm
- Mixed conditions

## Maintaining Effects

When editing effects:

1. Keep visual layers decorative with `aria-hidden`.
2. Avoid theme variables inside the hero unless the design explicitly wants theme coupling.
3. Prefer CSS-only motion for simple atmospheric effects.
4. Keep loops seamless by ending at tile-aligned positions.
5. Use Test mode to check both day and night variants.
