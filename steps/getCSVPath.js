import React, { useState } from "react";
import { render, Box, Text, useInput } from "ink";
import fs from "fs";
import { sanitizePath } from "../lib/sanitize-path";

const CSVInput = ({ onSubmit }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  useInput((inputChar, key) => {
    if (key.return) {
      const sanitizedInput = sanitizePath(input);
      if (!sanitizedInput) {
        setError("The CSV file path is required.");
        return;
      }
      if (!fs.existsSync(sanitizedInput)) {
        setError("❌ The provided CSV file was not found.");
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
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text color="green">Drag your CSV here or type the file path:</Text>
      <Box>
        <Text color="yellow">{input}</Text>
      </Box>
      {error && <Text color="red">{error}</Text>}
    </Box>
  );
};

export const getCSVPath = () => {
  return new Promise((resolve) => {
    const App = () => (
      <CSVInput
        onSubmit={(path) => {
          resolve(path);
          // process.exit(0); // Removed to avoid process termination
        }}
      />
    );

    render(<App />);
  });
};

export { CSVInput };
