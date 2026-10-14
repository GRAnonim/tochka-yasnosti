import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { AbcPractice } from "@/lib/types";
import { formatPracticeDate } from "@/lib/practices";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function abcFilename(entry: AbcPractice, ext: string): string {
  const day = entry.createdAt.slice(0, 10);
  return `abc-dnevnik-${day}.${ext}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function abcSections(entry: AbcPractice): { title: string; body: string }[] {
  const sections = [
    { title: "A: Активирующее событие", body: entry.activating },
    { title: "B: Убеждения / мысли", body: entry.beliefs },
    {
      title: "C: Последствия (чувства, поведение)",
      body: entry.consequences,
    },
  ];
  if (entry.reframe.trim()) {
    sections.push({
      title: "Альтернативная мысль",
      body: entry.reframe,
    });
  }
  return sections;
}

function abcPrintableHtml(entry: AbcPractice): string {
  const blocks = abcSections(entry)
    .map(
      (s) => `
      <section>
        <h2>${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.body).replace(/\n/g, "<br/>")}</p>
      </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>ABC-дневник · Точка ясности</title>
  <style>
    body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #24383e; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin: 0 0 0.35rem; }
    .meta { color: #5a7279; font-size: 0.95rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.05rem; margin: 1.25rem 0 0.4rem; }
    p { margin: 0 0 0.75rem; white-space: pre-wrap; }
    footer { margin-top: 2rem; font-size: 0.85rem; color: #6e868d; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>ABC-дневник</h1>
  <p class="meta">Точка ясности · ${escapeHtml(formatPracticeDate(entry.createdAt))}<br/>
  Не диагноз и не терапия: запись для себя или для специалиста.</p>
  ${blocks}
  <footer>«Точка ясности» не заменяет врача или психолога.</footer>
  <script>window.onload = function () { window.focus(); window.print(); };</script>
</body>
</html>`;
}

/**
 * PDF via system print dialog («Сохранить как PDF»).
 * Keeps Russian text correct without embedding fonts.
 */
export function exportAbcPdf(entry: AbcPractice): void {
  const html = abcPrintableHtml(entry);
  const w = window.open("", "_blank");
  if (!w) {
    // Popup blocked — fall back to HTML download
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerDownload(blob, abcFilename(entry, "html"));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/** .docx for Word / Google Docs / sending to a specialist */
export async function exportAbcWord(entry: AbcPractice): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      text: "ABC-дневник",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Точка ясности · ${formatPracticeDate(entry.createdAt)}`,
          italics: true,
          size: 20,
          color: "5A7279",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Не диагноз и не терапия: запись для себя или для специалиста.",
          size: 20,
          color: "5A7279",
        }),
      ],
      spacing: { after: 320 },
    }),
  ];

  for (const s of abcSections(entry)) {
    children.push(
      new Paragraph({
        text: s.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: s.body, size: 24 })],
        spacing: { after: 160 },
        alignment: AlignmentType.LEFT,
      }),
    );
  }

  const document = new Document({
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(document);
  triggerDownload(blob, abcFilename(entry, "docx"));
}
