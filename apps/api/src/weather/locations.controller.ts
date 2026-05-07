import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import type { LocationOption } from "@jetstream-weather/domain";
import { LocationSearchQueryDto } from "./weather.dto.js";
import { OpenMeteoService } from "./open-meteo.service.js";

@ApiTags("locations")
@Controller("locations")
export class LocationsController {
  constructor(@Inject(OpenMeteoService) private readonly openMeteo: OpenMeteoService) {}

  @Get("search")
  @ApiQuery({
    name: "query",
    required: false,
    schema: { default: "London", example: "London, England", type: "string" },
  })
  @ApiQuery({
    name: "name",
    required: false,
    schema: { default: "London", example: "London", type: "string" },
  })
  @ApiQuery({
    name: "region",
    required: false,
    schema: { default: "England", example: "England", type: "string" },
  })
  @ApiQuery({
    name: "country",
    required: false,
    schema: { default: "United Kingdom", example: "United Kingdom", type: "string" },
  })
  @ApiOkResponse({ description: "Matching Open-Meteo geocoding locations." })
  search(@Query() query: LocationSearchQueryDto): Promise<LocationOption[]> {
    const locationQuery = [query.name ?? query.query ?? "London", query.region, query.country]
      .filter(Boolean)
      .join(", ");

    return this.openMeteo.searchLocations(locationQuery);
  }
}
