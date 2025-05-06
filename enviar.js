#!/usr/bin/env node

import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput } from "ink";
import open from "open";
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

  // Função para abrir o template HTML
  const previewTemplate = async () => {
    try {
      await open("./template.html");
    } catch (err) {
      console.error("Erro ao abrir o template:", err.message);
    }
  };

  // Captura de teclas no passo de confirmação
  useInput((input) => {
    if (step === "confirm") {
      if (input === "v" || input === "V") {
        previewTemplate();
      } else if (input === "y" || input === "Y") {
        setStep("processing");
      } else if (input === "n" || input === "N") {
        setCsvPath(null);
        setStep("input");
      }
    }
  });

  // Processamento e envio após confirmação
  useEffect(() => {
    const processCSV = async () => {
      try {
        const csvReader = new CSVReader();
        const contacts = await csvReader.read(csvPath);
        setContatos(contacts);
        setStep("sending");

        const templateRenderer = new TemplateRenderer("./template.html");
        const emailSender = new EmailSender();

        for (const [i, contato] of contacts.entries()) {
          try {
            const html = templateRenderer.render(contato);
            await emailSender.send(contato.email, html, i + 1, contacts.length);
            setProgress(((i + 1) / contacts.length) * 100);
          } catch (err) {
            console.error(
              `❌ Erro ao enviar para ${contato.email}: ${err.message}`
            );
          }
        }

        setStep("done");
      } catch (err) {
        if (err.message === "No recipients defined") {
          console.error("Não ha mais destinatários definidos.");
        } else {
          setError(err.message);
          setStep("error");
        }
      }
    };

    if (step === "processing") {
      processCSV();
    }
  }, [step, csvPath]);

  // Renderização de acordo com o passo
  if (step === "input") {
    return (
      <Box>
        <CSVInput
          onSubmit={(path) => {
            setCsvPath(path);
            setStep("confirm");
          }}
        />
      </Box>
    );
  }

  if (step === "confirm") {
    return (
      <Box flexDirection="column">
        <Text>📂 Arquivo carregado: {csvPath}</Text>
        <Text>👀 Deseja visualizar o template antes de enviar?</Text>
        <Text>[V] Visualizar [Y] Enviar [N] Cancelar</Text>
      </Box>
    );
  }

  if (step === "processing") {
    return (
      <Box>
        <Text>📂 Lendo CSV e preparando envios...</Text>
      </Box>
    );
  }

  if (step === "sending") {
    return (
      <Box>
        <Text>Processando envios...</Text>
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
