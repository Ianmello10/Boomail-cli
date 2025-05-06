import React, { useState } from "react";
import { render, Box, Text, useInput } from "ink";
import fs from "fs";
import chalk from "chalk";

const CSVInput = ({ onSubmit }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const sanitizePath = (path) => {
    // Remove aspas do início e fim do caminho
    return path.replace(/^["'](.+)["']$/, '$1').trim();
  };

  useInput((inputChar, key) => {
    if (key.return) {
      const sanitizedInput = sanitizePath(input);
      if (!sanitizedInput) {
        setError("O caminho do arquivo CSV é obrigatório.");
        return;
      }
      if (!fs.existsSync(sanitizedInput)) {
        setError("❌ O arquivo CSV fornecido não foi encontrado.");
        return;
      }
      setError(null);
      onSubmit(sanitizedInput);
    } else if (key.backspace) {
      setInput((prev) => prev.slice(0, -1));
    } else {
      setInput((prev) => prev + inputChar);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text color="green">Arraste seu CSV aqui ou digite o caminho:</Text>
      <Box>
        <Text color="yellow">{input}</Text>
      </Box>
      {error && (
        <Text color="red">{error}</Text>
      )}
    </Box>
  );
};

export const getCSVPath = () => {
  return new Promise((resolve) => {
    const App = () => (
      <CSVInput onSubmit={(path) => {
        resolve(path);
        // process.exit(0); // Removido para evitar o encerramento do processo
      }} />
    );

    render(<App />);
  });
};

export { CSVInput };
