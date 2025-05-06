import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export class TemplateRenderer {
  constructor(templateFileName) {
    const templatePath = path.resolve(templateFileName);
    this.templateHTML = fs.readFileSync(templatePath, "utf8");
    this.template = handlebars.compile(this.templateHTML);
  }

  render(data) {
    return this.template(data);
  }
}