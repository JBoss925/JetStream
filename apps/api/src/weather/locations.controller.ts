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
    schema: { default: "London", example: "London", type: "string" },
  })
  @ApiOkResponse({ description: "Matching Open-Meteo geocoding locations." })
  search(@Query() query: LocationSearchQueryDto): Promise<LocationOption[]> {
    return this.openMeteo.searchLocations(query.query ?? "London");
  }
}
