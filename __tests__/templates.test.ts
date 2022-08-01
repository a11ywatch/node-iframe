import { load } from "cheerio";

import {
  templateModel,
  configureTemplates,
  TemplateType,
} from "@app/templates";
import { fetchFrame } from "@app/iframe";

const url = process.env.API_URL || "https://www.drake.com";

describe("template configuration", () => {
  const template = load("<div>test</div>").html();
  const { all, error, notFound } = TemplateType;

  test("is updated error template", () => {
    configureTemplates(template, error);
    expect(templateModel[error]).toBe(template);
  });

  test("is updated not-found template", () => {
    configureTemplates(template, notFound);
    expect(templateModel[notFound]).toBe(template);
  });

  test("is updated not found template on request non server from incorrect request", async () => {
    const res = await fetchFrame({ url: `/dwd/${url}` });

    expect(res).toBe(template);
  });

  test("is updated all templates to same type", () => {
    const newTemplate = load("<div>new</div>").html();

    configureTemplates(newTemplate, all);

    Object.keys(templateModel).forEach((item) => {
      expect(templateModel[item]).toBe(newTemplate);
    });
  });
});
