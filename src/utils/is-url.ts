import { URL } from "./url";

// determine if is url or not. Silent errors to avoid spam.
export const isUrl = (domain: string) => {
  if (!domain) {
    return;
  }
  if (domain.startsWith("/iframe?url=")) {
    domain = domain.replace("/iframe?url=", "");
  }
  try {
    return !!new URL(domain);
  } catch (_e) {
    return false;
  }
};
