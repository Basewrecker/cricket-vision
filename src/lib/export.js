/**
 * Generates a PDF cricket action analysis report as a Blob.
 * Exports: generateReport(bowlerName, date, frames, summary) → Promise<Blob>
 *
 * Assumptions:
 *   - frames[i].dataUrl        — valid image data URL (PNG or JPEG)
 *   - frames[i].overallScore   — number; falls back to frames[i].poseResults?.overallScore
 *   - summary.overallScore     — number 0–100
 *   - summary.topIssues        — string[]
 *
 * Pseudo-tests (no test runner installed):
 *   ✓ generateReport('Ali', '2026-05-06', frames, summary)
 *       → resolves to a Blob with type 'application/pdf'
 *   ✓ generateReport('Ali', '2026-05-06', [], { overallScore: 0, topIssues: [] })
 *       → page 2 shows "No frames available." gracefully
 *   ✓ generateReport('Ali', '2026-05-06', frames, { overallScore: 74, topIssues: [] })
 *       → top issues section shows "No issues detected."
 *   ✓ generateReport(null, null, null, null)
 *       → uses safe fallbacks, no throw
 *   ✓ frame with no dataUrl → placeholder rect drawn, no crash
 *   ✓ frame.dataUrl with corrupt data → caught, placeholder rect drawn
 */

import { jsPDF } from 'jspdf';

const IMG_FORMAT = (dataUrl) => {
  if (typeof dataUrl !== 'string') return 'JPEG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

const getFrameScore = (frame) =>
  frame?.overallScore ?? frame?.poseResults?.overallScore ?? Infinity;

export async function generateReport(bowlerName, date, frames, summary) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Page 1 ────────────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text('Cricket Action Analysis Report', PAGE_W / 2, 30, { align: 'center' });

  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN, 36, PAGE_W - MARGIN, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text(`Bowler: ${bowlerName ?? 'Unknown'}`, MARGIN, 48);
  doc.text(`Date: ${date ?? 'N/A'}`, MARGIN, 57);

  // Overall score — large centred display
  const overallScore = Number.isFinite(summary?.overallScore) ? summary.overallScore : 0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`${overallScore} / 100`, PAGE_W / 2, 94, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('Overall Score', PAGE_W / 2, 103, { align: 'center' });

  // Top issues
  const issues = Array.isArray(summary?.topIssues) ? summary.topIssues : [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text('Top Issues', MARGIN, 120);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);

  if (issues.length === 0) {
    doc.text('No issues detected.', MARGIN, 132);
  } else {
    let cursorY = 132;
    issues.forEach((issue, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${String(issue)}`, CONTENT_W);
      doc.text(lines, MARGIN, cursorY);
      cursorY += lines.length * 7;
    });
  }

  // ── Page 2 ────────────────────────────────────────────────────────────────

  doc.addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('Worst Frames', MARGIN, 24);

  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN, 30, PAGE_W - MARGIN, 30);

  // Sort frames by score ascending, take 6 lowest
  const safeFrames = Array.isArray(frames) ? frames : [];
  const worst6 = [...safeFrames]
    .sort((a, b) => getFrameScore(a) - getFrameScore(b))
    .slice(0, 6);

  if (worst6.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text('No frames available.', MARGIN, 46);
  } else {
    const COLS = 2;
    const COL_GAP = 10;
    const IMG_W = (CONTENT_W - COL_GAP * (COLS - 1)) / COLS; // ~85mm
    const IMG_H = IMG_W * 0.6;                                // ~51mm
    const LABEL_H = 8;
    const ROW_GAP = IMG_H + LABEL_H + 6;
    const START_Y = 38;

    worst6.forEach((frame, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = MARGIN + col * (IMG_W + COL_GAP);
      const y = START_Y + row * ROW_GAP;

      if (frame?.dataUrl) {
        try {
          doc.addImage(frame.dataUrl, IMG_FORMAT(frame.dataUrl), x, y, IMG_W, IMG_H);
        } catch {
          // Corrupt or unsupported image — draw grey placeholder
          doc.setFillColor(220, 220, 220);
          doc.rect(x, y, IMG_W, IMG_H, 'F');
        }
      } else {
        doc.setFillColor(220, 220, 220);
        doc.rect(x, y, IMG_W, IMG_H, 'F');
      }

      const score = getFrameScore(frame);
      const label = score === Infinity ? 'Score: N/A' : `Score: ${score}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(label, x + IMG_W / 2, y + IMG_H + 5, { align: 'center' });
    });
  }

  return doc.output('blob');
}
