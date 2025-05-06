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
  const [contacts, setContacts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Function to open the HTML template
  const previewTemplate = async () => {
    try {
      await open("./template.html");
    } catch (err) {
      console.error("Error opening the template:", err.message);
    }
  };

  // Key capture on the confirmation step
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

  // Processing and sending after confirmation
  useEffect(() => {
    const processCSV = async () => {
      try {
        const csvReader = new CSVReader();
        const contacts = await csvReader.read(csvPath);
        setContacts(contacts);
        setStep("sending");

        const templateRenderer = new TemplateRenderer("./template.html");
        const emailSender = new EmailSender();

        for (const [i, contact] of contacts.entries()) {
          try {
            const html = templateRenderer.render(contact);
            await emailSender.send(contact.email, html, i + 1, contacts.length);
            setProgress(((i + 1) / contacts.length) * 100);
          } catch (err) {
            console.error(`❌ Failed to send to ${contact.email}: ${err.message}`);
          }
        }

        setStep("done");
      } catch (err) {
        if (err.message === "No recipients defined") {
          console.error("No recipients defined.");
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

  // Step-based rendering
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
        <Text>📂 File loaded: {csvPath}</Text>
        <Text>👀 Do you want to preview the template before sending?</Text>
        <Text>[V] View   [Y] Send   [N] Cancel</Text>
      </Box>
    );
  }

  if (step === "processing") {
    return (
      <Box>
        <Text>📂 Reading CSV and preparing sends...</Text>
      </Box>
    );
  }

  if (step === "sending") {
    return (
      <Box>
        <Text>Sending emails...</Text>
      </Box>
    );
  }

  if (step === "done") {
    return (
      <Box>
        <Text>✅ All emails were sent successfully!</Text>
      </Box>
    );
  }

  if (step === "error") {
    return (
      <Box>
        <Text color="red">❌ Error: {error}</Text>
      </Box>
    );
  }

  return null;
};

render(<App />);
