import fs from "fs";
import csv from "csv-parser";
import chalk from "chalk";
import cliSpinners from 'cli-spinners';

export class CSVReader {
  constructor() {
    this.spinner = cliSpinners.dots;
    this.interval = null;
  }

  startSpinner() {
    let frame = 0;
    process.stdout.write('\r');
    this.interval = setInterval(() => {
      const spinnerFrame = this.spinner.frames[frame];
      process.stdout.write('\r' + ' '.repeat(100)); // Limpa a linha
      process.stdout.write('\r' + chalk.cyan(spinnerFrame) + ' Processando CSV...');
      frame = ++frame % this.spinner.frames.length;
    }, this.spinner.interval);
  }

  stopSpinner() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write('\r' + ' '.repeat(100) + '\r'); // Limpa a linha
    }
  }

  read(filePath) {
    return new Promise((resolve, reject) => {
      const contatos = [];
      let invalidCount = 0;

      this.startSpinner();

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          if (data.email && data.email.trim() !== "") {
            contatos.push(data);
          } else {
            invalidCount++;
          }
        })
        .on("end", () => {
          this.stopSpinner();
          if (contatos.length === 0) {
            console.log(chalk.red('✗ Nenhum contato válido encontrado no CSV'));
            reject(new Error("Nenhum contato válido encontrado no CSV"));
          } else {
            console.log(chalk.blue('📊 Resumo da importação:'));
            console.log(chalk.green('✓') + ` ${contatos.length} contatos válidos`);
            if (invalidCount > 0) {
              console.log(chalk.yellow('!') + ` ${invalidCount} contatos ignorados`);
            }
            console.log(); // Linha em branco para separação
            resolve(contatos);
          }
        })
        .on("error", (err) => {
          this.stopSpinner();
          console.log(chalk.red('✗ Erro ao ler o arquivo: ') + err.message);
          reject(err);
        });
    });
  }
}