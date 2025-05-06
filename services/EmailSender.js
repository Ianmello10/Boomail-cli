import nodemailer from "nodemailer";
import 'dotenv/config';
import chalk from "chalk";
import cliSpinners from 'cli-spinners';

export class EmailSender {
  #spinnerInterval = null;
  #spinner = cliSpinners.dots;
  #progressShown = false;

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
  }

  #logProgress(current, total) {
    const percent = Math.floor((current / total) * 100);
    const filled = Math.floor(percent / 5);
    const bar = chalk.cyan('▇'.repeat(filled)) + chalk.gray('░'.repeat(20 - filled));
    process.stdout.write(`\r${chalk.blue('Progress:')} [${bar}] ${chalk.yellow(`${percent}%`)}`);
  }

  #startSpinner(email) {
    let frame = 0;
    this.#spinnerInterval = setInterval(() => {
      const icon = this.#spinner.frames[frame];
      process.stdout.write(`\r${' '.repeat(100)}\r${chalk.cyan(icon)} Sending to ${chalk.yellow(email)}`);
      frame = (frame + 1) % this.#spinner.frames.length;
    }, this.#spinner.interval);
  }

  #stopSpinner() {
    clearInterval(this.#spinnerInterval);
    this.#spinnerInterval = null;
    process.stdout.write(`\r${' '.repeat(100)}\r`);
  }

  async send(to, html, index, total) {
    try {
      if (!this.#progressShown) {
        console.log(chalk.blue('📂 Reading CSV and preparing to send...'));
        this.#progressShown = true;
      }

      this.#logProgress(index - 1, total);
      this.#startSpinner(to);

      await this.transporter.sendMail({
        from: process.env.USER_SMTP,
        to,
        subject: "No Subject",
        html,
      });

      this.#stopSpinner();
      console.log(`  ${chalk.green('✓')} Email sent to ${chalk.yellow(to)} ${chalk.gray(`[${index}/${total}]`)}`);
      this.#logProgress(index, total);

      if (process.env.LIMITE_POR_MINUTO) {
        await this.#delay(60000 / process.env.LIMITE_POR_MINUTO);
      }
    } catch (err) {
      this.#stopSpinner();
      console.log(`  ${chalk.red('✗')} Failed to send to ${chalk.yellow(to)} ${chalk.gray(`[${index}/${total}]`)}\n    ${chalk.red(err.message)}`);
      throw err;
    }
  }

  #delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
