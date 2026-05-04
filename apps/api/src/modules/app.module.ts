import { Module } from "@nestjs/common";
import { LocationsController } from "../weather/locations.controller.js";
import { OpenMeteoService } from "../weather/open-meteo.service.js";
import { WeatherController } from "../weather/weather.controller.js";

@Module({
  controllers: [LocationsController, WeatherController],
  providers: [OpenMeteoService],
})
export class AppModule {}
