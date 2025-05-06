import fs from "fs";
import csv from "csv-parser";
import chalk from "chalk";
import cliSpinners from "cli-spinners";

export class CSVReader {
  #spinnerInterval = null;
  #spinner = cliSpinners.dots;

  #startSpinner() {
    let frame = 0;
    this.#spinnerInterval = setInterval(() => {
      const icon = this.#spinner.frames[frame];
      process.stdout.write(`\r${' '.repeat(100)}\r${chalk.cyan(icon)} Processing CSV...`);
      frame = (frame + 1) % this.#spinner.frames.length;
    }, this.#spinner.interval);
  }

  #stopSpinner() {
    clearInterval(this.#spinnerInterval);
    this.#spinnerInterval = null;
    process.stdout.write(`\r${' '.repeat(100)}\r`);
  }

  read(filePath) {
    return new Promise((resolve, reject) => {
      const contacts = [];
      let invalidCount = 0;

      this.#startSpinner();

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          if (data.email?.trim()) {
            contacts.push(data);
          } else {
            invalidCount++;
          }
        })
        .on("end", () => {
          this.#stopSpinner();

          if (!contacts.length) {
            console.log(chalk.red("✗ No valid contacts found in the CSV file"));
            return reject(new Error("No valid contacts found in the CSV file"));
          }

          console.log(chalk.blue("📊 Import summary:"));
          console.log(`${chalk.green("✓")} ${contacts.length} valid contacts`);
          if (invalidCount) {
            console.log(`${chalk.yellow("!")} ${invalidCount} contacts ignored`);
          }
          console.log(); // Extra spacing
          resolve(contacts);
        })
        .on("error", (err) => {
          this.#stopSpinner();
          console.log(chalk.red("✗ Error reading file: ") + err.message);
          reject(err);
        });
    });
  }
}