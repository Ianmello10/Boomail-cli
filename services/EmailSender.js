import nodemailer from "nodemailer";
import 'dotenv/config';
import chalk from "chalk";
import cliSpinners from 'cli-spinners';

export class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.PORT,
      secure: false,
      auth: {
        user: process.env.USER_SMTP,
        pass: process.env.PASS_SMTP,
      },
    });
    this.spinner = cliSpinners.dots;
    this.interval = null;
    this.progressInitialized = false;
  }

  updateProgressBar(current, total) {
    const progress = (current / total) * 100;
    const filled = Math.floor(progress / 5);
    process.stdout.write('\r' + ' '.repeat(100)); // Limpa a linha
    process.stdout.write(
      '\r' + 
      chalk.blue('Progresso: ') +
      '[' +
      chalk.cyan('▇'.repeat(filled)) +
      chalk.gray('░'.repeat(20 - filled)) +
      '] ' +
      chalk.yellow(`${Math.floor(progress)}%`)
    );
  }

  initializeProgress() {
    if (!this.progressInitialized) {
      console.log(chalk.blue('📂 Lendo CSV e preparando envios...'));
      this.progressInitialized = true;
    }
  }

  startSpinner(to) {
    let frame = 0;
    this.interval = setInterval(() => {
      const spinnerFrame = this.spinner.frames[frame];
      process.stdout.write('\r' + ' '.repeat(100)); // Limpa a linha
      process.stdout.write('\r  ' + chalk.cyan(spinnerFrame) + ' Enviando para ' + chalk.yellow(to));
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

  async send(to, html, currentIndex, total) {
    try {
      this.initializeProgress();
      this.updateProgressBar(currentIndex - 1, total);

      const mailOptions = {
        from: process.env.USER_SMTP,
        to,
        subject: "Sem Assunto",
        html,
      };

      this.startSpinner(to);
      await this.transporter.sendMail(mailOptions);
      this.stopSpinner();
      
      console.log(
        '  ' + chalk.green('✓') + 
        ' Email enviado para ' + 
        chalk.yellow(to) + 
        chalk.gray(` [${currentIndex}/${total}]`)
      );

      this.updateProgressBar(currentIndex, total);

      if (process.env.LIMITE_POR_MINUTO) {
        await this.delay(60000 / process.env.LIMITE_POR_MINUTO);
      }
    } catch (error) {
      this.stopSpinner();
      console.log(
        '  ' + chalk.red('✗') + 
        ' Falha ao enviar para ' + 
        chalk.yellow(to) + 
        chalk.gray(` [${currentIndex}/${total}]`) + 
        '\n    ' + chalk.red(error.message)
      );
      throw error;
    }
  }

  delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}