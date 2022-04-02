import { URL } from "./url";

export const isUrl = (domain: string) => {
  try {
    return !!new URL(domain.replace("/iframe?url=", ""));
  } catch (e) {
    console.error(e);
    return false;
  }
};
