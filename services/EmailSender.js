import nodemailer from "nodemailer";
import 'dotenv/config'

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
  }

  async send(to, html, currentIndex, total) {
    try {
      const mailOptions = {
        from: process.env.USER_SMTP, // Corrigido para usar o email do SMTP
        to,
        subject: "Sem Assunto",
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ [${currentIndex}/${total}] Email enviado para ${to}`);

      if (process.env.LIMITE_POR_MINUTO) {
        await this.delay(60000 / process.env.LIMITE_POR_MINUTO);
      }
    } catch (error) {
      console.error(`Erro ao enviar email: ${error.message}`);
      throw error;
    }
  }

  delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}