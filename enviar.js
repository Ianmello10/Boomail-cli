#!/usr/bin/env node

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
const configPath = path.resolve(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const templatePath = path.join(__dirname, "template.html");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Por favor, forneça o caminho para o arquivo CSV como argumento.");
    process.exit(1);
  }

  const listaPath = path.resolve(args[0]);

  if (!fs.existsSync(listaPath)) {
    console.error(`❌ O arquivo CSV fornecido não foi encontrado: ${listaPath}`);
    process.exit(1);
  }

  const contatos = [];

  // Lê o CSV
  fs.createReadStream(listaPath)
    .pipe(csv())
    .on("data", (data) => contatos.push(data))
    .on("end", async () => {
      console.log(`📬 ${contatos.length} contatos carregados.`);

      // Lê template
      const templateHTML = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(templateHTML);

      // Configura SMTP
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      });

      for (const [i, contato] of contatos.entries()) {
        try {
          const html = template(contato);
          const mailOptions = {
            from: config.smtp.user,
            to: contato.email,
            subject: config.assunto,
            html
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ [${i + 1}/${contatos.length}] Email enviado para ${contato.email}`);

          if (config.limitePorMinuto) {
            await delay(60000 / config.limitePorMinuto);
          }
        } catch (err) {
          console.error(`❌ Erro ao enviar para ${contato.email}: ${err.message}`);
        }
      }

      console.log("✅ Todos os e-mails foram processados.");
    });
}

main();
