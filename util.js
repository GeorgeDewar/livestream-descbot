export function truncate(input, length) {
  if (input.length > length) {
    return input.substring(0, length) + "...";
  }
  return input;
}

export function checkEnv(variableName) {
  if (!process.env[variableName]) {
    throw new Error(`Required environment variable ${variableName} is not set`);
  }
  return process.env[variableName];
}