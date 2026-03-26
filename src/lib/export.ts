import type { ReportRecord } from "@/types/crm";

function downloadBlob(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReportsAsCsv(reports: ReportRecord[]) {
  const rows = [
    ["Title", "Type", "Date", "Description"],
    ...reports.map((report) => [report.title, report.type, report.date, report.description]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  downloadBlob(`crm-reports-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
}

export function openPrintableReport(reports: ReportRecord[]) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=1024,height=900");
  if (!printWindow) return;

  const markup = `
    <!doctype html>
    <html>
      <head>
        <title>CRM Reports</title>
        <style>
          :root { color-scheme: light dark; }
          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            background: #f5f7fb;
            color: #122033;
          }
          .page {
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
          }
          h1 { margin: 0 0 8px; font-size: 32px; }
          p { margin: 0 0 20px; color: #54657d; }
          .card {
            background: white;
            border: 1px solid #d9e2ef;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 14px;
          }
          .meta { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7b90; }
          .title { font-size: 18px; font-weight: 700; margin: 8px 0; }
          .desc { font-size: 14px; line-height: 1.6; margin: 0; }
        </style>
      </head>
      <body>
        <main class="page">
          <h1>Executive Report Pack</h1>
          <p>Print this view or use your browser save dialog to export as PDF.</p>
          ${reports
            .map(
              (report) => `
                <article class="card">
                  <div class="meta">
                    <span>${report.type}</span>
                    <span>${report.date}</span>
                  </div>
                  <div class="title">${report.title}</div>
                  <p class="desc">${report.description}</p>
                </article>
              `,
            )
            .join("")}
        </main>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(markup);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
