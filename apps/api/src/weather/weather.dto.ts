import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Units } from "@jetstream-weather/domain";

export class LocationSearchQueryDto {
  @ApiProperty({ default: "London", example: "London" })
  query = "London";

  @ApiPropertyOptional({ default: "London", example: "London" })
  name?: string;

  @ApiPropertyOptional({ default: "England", example: "England" })
  region?: string;

  @ApiPropertyOptional({ default: "United Kingdom", example: "United Kingdom" })
  country?: string;
}

export class WeatherQueryDto {
  @ApiProperty({ default: "51.5072", example: "51.5072" })
  latitude = "51.5072";

  @ApiProperty({ default: "-0.1276", example: "-0.1276" })
  longitude = "-0.1276";

  @ApiProperty({ default: "London", example: "London" })
  name = "London";

  @ApiProperty({ default: "United Kingdom", example: "United Kingdom" })
  country = "United Kingdom";

  @ApiPropertyOptional({ default: "England", example: "England" })
  region = "England";

  @ApiPropertyOptional({ default: "Europe/London", example: "Europe/London" })
  timezone = "Europe/London";

  @ApiPropertyOptional({ enum: ["imperial", "metric"], default: "imperial" })
  units: Units = "imperial";
}
