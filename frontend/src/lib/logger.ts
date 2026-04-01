const isDev = import.meta.env.DEV;

export function reportError(message: string, error?: unknown) {
  if (!isDev) return;

  if (error === undefined) {
    console.error(message);
    return;
  }

  console.error(message, error);
}
