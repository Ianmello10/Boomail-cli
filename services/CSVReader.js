import fs from "fs";
import csv from "csv-parser";

export class CSVReader {
  read(filePath) {
    return new Promise((resolve, reject) => {
      const contatos = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Validar se o email existe e não está vazio
          if (data.email && data.email.trim() !== "") {
            contatos.push(data);
          } else {
            console.log(`⚠️ Ignorando contato sem email: ${JSON.stringify(data)}`);
          }
        })
        .on("end", () => {
          if (contatos.length === 0) {
            reject(new Error("Nenhum contato válido encontrado no CSV"));
          } else {
            console.log(`✅ ${contatos.length} contatos válidos encontrados`);
            resolve(contatos);
          }
        })
        .on("error", (err) => reject(err));
    });
  }
}