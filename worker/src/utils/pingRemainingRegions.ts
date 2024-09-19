import { AWSRegion, ChinaAwsRegion } from "../constants/aws";
import { ping } from "./ping";

export type RegionToLatency = Record<AWSRegion | ChinaAwsRegion, {
  firstPingLatency: number;
  secondPingLatency: number;
}>;

export async function pingRemainingRegions(
  regions: (AWSRegion | ChinaAwsRegion)[],
  existingResults: RegionToLatency = {} as RegionToLatency,
) {
  const results = {} as RegionToLatency;

  await Promise.all(
    regions.map(async (region) => {
      if (existingResults[region] !== undefined) {
        results[region] = existingResults[region];
      } else {
        results[region] = await ping(region); // Concurrent execution
      }
    })
  );

  return results;
}
