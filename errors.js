import fs from "fs";

export class ArgumentValidator {
  static validate(args) {
    if (args.length === 0) {
      console.error("❌ Please provide the path to the CSV file as an argument.");
      process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`❌ The provided CSV file was not found: ${filePath}`);
      process.exit(1);
    }

    return filePath;
  }
}


