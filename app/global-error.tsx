"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily:
            "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          background: "#f6efe2",
          color: "#1f1d1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#5a574f",
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.1,
              margin: "1rem 0 1.25rem",
            }}
          >
            The site couldn&apos;t load.
          </h1>
          <p style={{ lineHeight: 1.6, color: "#3b3a35" }}>
            Something failed before the page could render. Try reloading.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.25rem",
              border: "none",
              borderRadius: 9999,
              background: "#1f1d1a",
              color: "#f6efe2",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
