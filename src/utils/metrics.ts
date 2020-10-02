import { fetchFrame } from "@app/iframe";

interface FetchParams {
  url: string;
  operation?: string;
  log?: boolean;
}

interface FetchResponse {
  res: string;
  t0: number;
  t1: number;
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
