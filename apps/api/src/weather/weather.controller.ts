import { BadRequestException, Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import type {
  LocationOption,
  NormalizedWeatherResponse,
  Units,
} from "@jetstream-weather/domain";
import { OpenMeteoService } from "./open-meteo.service.js";
import { WeatherQueryDto } from "./weather.dto.js";

@ApiTags("weather")
@Controller("weather")
export class WeatherController {
  constructor(@Inject(OpenMeteoService) private readonly openMeteo: OpenMeteoService) {}

  @Get()
  @ApiQuery({
    name: "latitude",
    required: false,
    schema: { default: "51.5072", example: "51.5072", type: "string" },
  })
  @ApiQuery({
    name: "longitude",
    required: false,
    schema: { default: "-0.1276", example: "-0.1276", type: "string" },
  })
  @ApiQuery({
    name: "name",
    required: false,
    schema: { default: "London", example: "London", type: "string" },
  })
  @ApiQuery({
    name: "country",
    required: false,
    schema: { default: "United Kingdom", example: "United Kingdom", type: "string" },
  })
  @ApiQuery({
    name: "region",
    required: false,
    schema: { default: "England", example: "England", type: "string" },
  })
  @ApiQuery({
    name: "timezone",
    required: false,
    schema: { default: "Europe/London", example: "Europe/London", type: "string" },
  })
  @ApiQuery({
    name: "units",
    required: false,
    enum: ["imperial", "metric"],
    schema: { default: "imperial", example: "imperial", type: "string" },
  })
  @ApiOkResponse({ description: "Normalized current, hourly, and daily weather." })
  getWeather(@Query() query: WeatherQueryDto): Promise<NormalizedWeatherResponse> {
    const latitude = Number(query.latitude ?? "51.5072");
    const longitude = Number(query.longitude ?? "-0.1276");

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new BadRequestException("latitude and longitude must be valid numbers.");
    }

    const location: LocationOption = {
      id: `${latitude},${longitude}`,
      name: query.name ?? "London",
      region: query.region ?? "England",
      country: query.country ?? "United Kingdom",
      latitude,
      longitude,
      timezone: query.timezone || "Europe/London",
    };
    const units: Units = query.units === "metric" ? "metric" : "imperial";

    return this.openMeteo.getWeather(location, units);
  }
}
