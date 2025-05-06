import fs from "fs";
import csv from "csv-parser";

export class CSVReader {
  read(filePath) {
    return new Promise((resolve, reject) => {
      const contatos = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => contatos.push(data))
        .on("end", () => {
          if (contatos.length === 0) {
            console.log("✅ Arquivo CSV processado, mas nenhum dado foi encontrado.");
            resolve(contatos);
          } else {
            resolve(contatos);
          }
        })
        .on("error", (err) => reject(err));
    });
  }
}