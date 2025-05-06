#!/usr/bin/env node

// Adicionei um comentário para lembrar que o arquivo precisa ser transpilado antes de ser executado
// Certifique-se de rodar `npm run build` antes de `npm start`

import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { EmailSender } from "./services/EmailSender.js";
import { CSVReader } from "./services/CSVReader.js";
import { TemplateRenderer } from "./services/TemplateRenderer.js";
import { CSVInput } from "./steps/getCSVPath.js";

const App = () => {
  const [step, setStep] = useState("input");
  const [csvPath, setCsvPath] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCSV = async () => {
      try {
        const csvReader = new CSVReader();
        const contatos = await csvReader.read(csvPath);
        setContatos(contatos);
        setStep("sending");

        const templateRenderer = new TemplateRenderer("./template.html");
        const emailSender = new EmailSender();

        for (const [i, contato] of contatos.entries()) {
          try {
            const html = templateRenderer.render(contato);
            await emailSender.send(contato.email, html, i + 1, contatos.length);
            setProgress(((i + 1) / contatos.length) * 100);
          } catch (err) {
            console.error(`❌ Erro ao enviar para ${contato.email}: ${err.message}`);
          }
        }

        setStep("done");
      } catch (err) {
        setError(err.message);
        setStep("error");
      }
    };

    if (step === "processing") {
      processCSV();
    }
  }, [step, csvPath]);

  if (step === "input") {
    return (
      <CSVInput
        onSubmit={(path) => {
          setCsvPath(path);
          setStep("processing");
        }}
      />
    );
  }

  if (step === "processing") {
    return (
      <Box>
        <Text>📂 Processando o arquivo CSV...</Text>
      </Box>
    );
  }

  if (step === "sending") {
    return (
      <Box>
        <Text>📤 Enviando e-mails... Progresso: {progress.toFixed(2)}%</Text>
      </Box>
    );
  }

  if (step === "done") {
    return (
      <Box>
        <Text>✅ Todos os e-mails foram enviados com sucesso!</Text>
      </Box>
    );
  }

  if (step === "error") {
    return (
      <Box>
        <Text color="red">❌ Erro: {error}</Text>
      </Box>
    );
  }

  return null;
};

render(<App />);
