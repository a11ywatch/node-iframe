import { WEBSITE_NOT_FOUND_TEMPLATE, NO_URL_TEMPLATE } from "./pages";
import { TemplateType } from "./config";

const templateModel = {
  [TemplateType.error]: NO_URL_TEMPLATE,
  [TemplateType.notFound]: WEBSITE_NOT_FOUND_TEMPLATE,
};

export { templateModel };
