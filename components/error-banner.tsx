function isDisconnectError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return error.name === "TypeError" && (message.includes("fetch") || message.includes("network"));
}

export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: {
  error: Error;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <p>
        {isDisconnectError(error)
          ? "Can't reach the server. Make sure it's running, then try again."
          : error.message}
      </p>
      <div className="flex gap-4 text-xs font-medium">
        <button type="button" onClick={onRetry} className="underline underline-offset-2">
          Try again
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-500 underline underline-offset-2 dark:text-red-400"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
