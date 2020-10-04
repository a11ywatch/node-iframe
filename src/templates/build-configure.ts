import { templateModel } from "./build";
import { TemplateType } from "./config";

type ConfigureTemplates = (template: string, type: TemplateType) => void;

const configureTemplates: ConfigureTemplates = (template, type) => {
  const { all, error, notFound } = TemplateType;

  switch (type) {
    case error:
      templateModel[error] = template;
      break;
    case notFound:
      templateModel[notFound] = template;
      break;
    case all:
      Object.keys(templateModel).forEach((item) => {
        templateModel[item] = template;
      });
      break;
    default:
      // console.log(`${type}: configured`);
      break;
  }
};

export { configureTemplates };
