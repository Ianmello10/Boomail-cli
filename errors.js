import fs from "fs";

export class ArgumentValidator {
  static validate(args) {
    if (args.length === 0) {
      console.error("❌ Por favor, forneça o caminho para o arquivo CSV como argumento.");
      process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`❌ O arquivo CSV fornecido não foi encontrado: ${filePath}`);
      process.exit(1);
    }

    return filePath;
  }
}

