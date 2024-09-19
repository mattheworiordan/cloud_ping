import {
  AWSRegion, ChinaAwsRegion, chinaAwsRegions
} from "../constants/aws";
import { ConcurrencyLimiter } from "./concurrencyLimiter";

// Stay below Cloudflare limit of 6 https://developers.cloudflare.com/workers/platform/limits
// 6 / 2 because we are doing 2 pings per region
const concurrencyLimiter = new ConcurrencyLimiter(6 / 2); 

export async function ping(region: (AWSRegion | ChinaAwsRegion)) {
  return concurrencyLimiter.run(async () => {
    const url = chinaAwsRegions.includes(region as ChinaAwsRegion) ?
      `http://dynamodb.${region}.amazonaws.com.cn/ping` :
      `http://dynamodb.${region}.amazonaws.com/ping`;

    console.log(`Pinging region: ${region} URL: ${url}`);

    const start = performance.now();
    await fetch(url);
    const middle = performance.now();
    await fetch(url);
    const end = performance.now();

    const firstPingLatency = middle - start;
    const secondPingLatency = end - middle;

    return {
      firstPingLatency,
      secondPingLatency,
    };
  });
}
