import { load } from "cheerio";

import {
  templateModel,
  configureTemplates,
  TemplateType,
} from "@app/templates";
import { fetchFrame } from "@app/iframe";
import { url } from "@app/config";

const template = load("<div>test</div>").html();
const { all, error, notFound } = TemplateType;

describe("template configuration", () => {
  test("is updated error template", async () => {
    configureTemplates(template, error);
    expect(templateModel[error]).toBe(template);
  });

  test("is updated not-found template", async () => {
    configureTemplates(template, notFound);
    expect(templateModel[notFound]).toBe(template);
  });

  test("is updated not found template on request", async () => {
    const res = await fetchFrame({ url: `/dwd/${url}` });

    expect(res).toBe(template);
  });

  test("is updated all templates to same type", async () => {
    const newTemplate = load("<div>new</div>").html();

    configureTemplates(newTemplate, all);

    Object.keys(templateModel).forEach((item) => {
      expect(templateModel[item]).toBe(newTemplate);
    });
  });
});
