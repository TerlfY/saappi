import clearIcon from "./assets/icons/large/10000_clear_large@2x.png";
import cloudyIcon from "./assets/icons/large/10010_cloudy_large@2x.png";
import MostlyClearIcon from "./assets/icons/large/11000_mostly_clear_large@2x.png";
import PartlyCloudyIcon from "./assets/icons/large/11010_partly_cloudy_large@2x.png";
import MostlyCloudyIcon from "./assets/icons/large/11020_mostly_cloudy_large@2x.png";
import FogIcon from "./assets/icons/large/20000_fog_large@2x.png";
import LightFogIcon from "./assets/icons/large/20000_fog_large@2x.png";
import DrizzleIcon from "./assets/icons/large/40000_drizzle_large@2x.png";
import RainIcon from "./assets/icons/large/40010_rain_large@2x.png";
import LightRainIcon from "./assets/icons/large/42000_rain_light_large@2x.png";
import HeavyRainIcon from "./assets/icons/large/42010_rain_heavy_large@2x.png";
import SnowIcon from "./assets/icons/large/50000_snow_large@2x.png";
import FlurriesIcon from "./assets/icons/large/50010_flurries_large@2x.png";
import LightSnowIcon from "./assets/icons/large/51000_snow_light_large@2x.png";
import HeavySnowIcon from "./assets/icons/large/51010_snow_heavy_large@2x.png";
import FreezingDrizzleIcon from "./assets/icons/large/60000_freezing_rain_drizzle_large@2x.png";
import FreezingRainIcon from "./assets/icons/large/60010_freezing_rain_large@2x.png";
import FreezingLightRainIcon from "./assets/icons/large/62000_freezing_rain_light_large@2x.png";
import FreezingHeavyRainIcon from "./assets/icons/large/62010_freezing_rain_heavy_large@2x.png";
import IcePelletsIcon from "./assets/icons/large/70000_ice_pellets_large@2x.png";
import HeavyIcePelletsIcon from "./assets/icons/large/71010_ice_pellets_heavy_large@2x.png";
import LightIcePelletsIcon from "./assets/icons/large/71020_ice_pellets_light_large@2x.png";
import ThunderstormIcon from "./assets/icons/large/80000_tstorm_large@2x.png";

const weatherIcons = {
  1000: clearIcon,
  1001: cloudyIcon,
  1100: MostlyClearIcon,
  1101: PartlyCloudyIcon,
  1102: MostlyCloudyIcon,
  2000: FogIcon,
  2100: LightFogIcon,
  4000: DrizzleIcon,
  4001: RainIcon,
  4200: LightRainIcon,
  4201: HeavyRainIcon,
  5000: SnowIcon,
  5001: FlurriesIcon,
  5100: LightSnowIcon,
  5101: HeavySnowIcon,
  6000: FreezingDrizzleIcon,
  6001: FreezingRainIcon,
  6200: FreezingLightRainIcon,
  6201: FreezingHeavyRainIcon,
  7000: IcePelletsIcon,
  7101: HeavyIcePelletsIcon,
  7102: LightIcePelletsIcon,
  8000: ThunderstormIcon,
};

export function getIcon(weatherCode) {
  return weatherIcons[weatherCode];
}
