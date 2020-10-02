import { fetchFrame } from "@app/iframe";

interface FetchParams {
  url: string;
  operation?: string;
  log?: boolean;
}

export type TimeStampMetrics = {
  t0: number;
  t1: number;
};

interface FetchResponse extends TimeStampMetrics {
  res: string;
}

const fetchWithTimestamps = async ({
  url,
  operation,
  log,
}: FetchParams): Promise<FetchResponse> => {
  const t0 = Date.now();
  const res = await fetchFrame({ url });
  const t1 = Date.now();
  log && console.log(`${operation || "Operation"}: ${t1 - t0} milliseconds.`);
  return { res, t0, t1 };
};

export { fetchWithTimestamps };
