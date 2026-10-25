import { jsPDF } from 'jspdf';
import { formatPercent, formatConfidence } from './format';

async function loadImageAsBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;
  
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch (err) {
    return null;
  }
}

export async function generateReport(result, beforeUrl, afterUrl) {
  if (!result) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Background style
  doc.setFillColor(7, 9, 12); // #07090C
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header Box
  doc.setFillColor(14, 18, 23); // #0E1217
  doc.setDrawColor(35, 42, 51); // #232A33
  doc.setLineWidth(0.3);
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'FD');

  // Top Title & Classification
  doc.setTextColor(255, 90, 31); // Accent
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text('ORBITAL DELTA // SATELLITE PHOTO REPORT', margin + 4, y + 6);

  doc.setTextColor(138, 146, 157); // Muted
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(`ID: ${result.id || 'OD-448B'} | TIMESTAMP: ${timestamp}`, margin + 4, y + 12);
  doc.text('AI SATELLITE CHANGE DETECTION REPORT', margin + 4, y + 17);

  y += 28;

  // Key Telemetry Metrics Strip
  doc.setFillColor(14, 18, 23);
  doc.rect(margin, y, pageWidth - margin * 2, 16, 'FD');

  const colWidth = (pageWidth - margin * 2) / 3;

  // Metric 1: Changed Area
  doc.setTextColor(138, 146, 157);
  doc.setFontSize(7);
  doc.text('AREA CHANGED', margin + 4, y + 5);
  doc.setTextColor(255, 90, 31);
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text(formatPercent(result.changed_area_percent), margin + 4, y + 12);

  // Metric 2: Regions Detected
  doc.setTextColor(138, 146, 157);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text('CHANGES FOUND', margin + colWidth + 4, y + 5);
  doc.setTextColor(236, 238, 241);
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text(`${(result.regions && result.regions.length) || 0} AREAS`, margin + colWidth + 4, y + 12);

  // Metric 3: Confidence
  doc.setTextColor(138, 146, 157);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text('HOW SURE THE AI IS', margin + colWidth * 2 + 4, y + 5);
  doc.setTextColor(61, 220, 132); // #3DDC84 ok
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text(formatConfidence(result.avg_confidence), margin + colWidth * 2 + 4, y + 12);

  y += 22;

  // Embed Imagery (Before / After)
  const imgBoxW = (pageWidth - margin * 2 - 6) / 2;
  const imgBoxH = 46;

  const [b64Before, b64After] = await Promise.all([
    loadImageAsBase64(beforeUrl),
    loadImageAsBase64(afterUrl),
  ]);

  // Before Box
  doc.setFillColor(14, 18, 23);
  doc.rect(margin, y, imgBoxW, imgBoxH, 'FD');
  if (b64Before) {
    try {
      doc.addImage(b64Before, 'JPEG', margin + 1, y + 1, imgBoxW - 2, imgBoxH - 8);
    } catch (e) {
      // image fallback
    }
  }
  doc.setTextColor(138, 146, 157);
  doc.setFontSize(7);
  doc.setFont('courier', 'bold');
  doc.text('BEFORE PHOTO', margin + 3, y + imgBoxH - 2);

  // After Box
  doc.rect(margin + imgBoxW + 6, y, imgBoxW, imgBoxH, 'FD');
  if (b64After) {
    try {
      doc.addImage(b64After, 'JPEG', margin + imgBoxW + 7, y + 1, imgBoxW - 2, imgBoxH - 8);
    } catch (e) {
      // image fallback
    }
  }
  doc.setTextColor(255, 90, 31);
  doc.text('AFTER PHOTO', margin + imgBoxW + 9, y + imgBoxH - 2);

  y += imgBoxH + 8;

  // Region Table Header
  doc.setTextColor(236, 238, 241);
  doc.setFontSize(9);
  doc.setFont('courier', 'bold');
  doc.text('CHANGED AREAS', margin, y);
  y += 4;

  doc.setFillColor(20, 26, 33);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'FD');
  doc.setTextColor(138, 146, 157);
  doc.setFontSize(7);
  doc.text('ID', margin + 2, y + 4);
  doc.text('TYPE', margin + 14, y + 4);
  doc.text('LABEL', margin + 46, y + 4);
  doc.text('CONF', margin + 84, y + 4);
  doc.text('DESCRIPTION & SIZE', margin + 104, y + 4);
  y += 6;

  // Table Rows
  const regions = result.regions || [];
  regions.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 14 : 11, isEven ? 18 : 14, isEven ? 23 : 19);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'FD');

    doc.setFont('courier', 'bold');
    doc.setTextColor(255, 90, 31);
    doc.text(r.id || `R${idx + 1}`, margin + 2, y + 5);

    const isHuman = r.classification === 'human-made';
    doc.setTextColor(isHuman ? 255 : 138, isHuman ? 90 : 146, isHuman ? 31 : 157);
    doc.text(isHuman ? 'HUMAN' : 'NATURAL', margin + 14, y + 5);

    doc.setTextColor(236, 238, 241);
    doc.setFont('courier', 'normal');
    doc.text(r.label || '-', margin + 46, y + 5);

    doc.setTextColor(61, 220, 132);
    doc.text(formatConfidence(r.confidence), margin + 84, y + 5);

    doc.setTextColor(138, 146, 157);
    const desc = r.description || '-';
    doc.text(desc.length > 45 ? desc.substring(0, 42) + '...' : desc, margin + 104, y + 5);

    y += 7;
  });

  y += 6;

  // Summary Report Narrative
  if (result.report && result.report.length > 0) {
    doc.setTextColor(236, 238, 241);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text('SUMMARY', margin, y);
    y += 4;

    doc.setFillColor(14, 18, 23);
    const reportBoxH = 36;
    doc.rect(margin, y, pageWidth - margin * 2, reportBoxH, 'FD');

    doc.setTextColor(170, 178, 188);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    
    let reportY = y + 5;
    result.report.forEach((paragraph) => {
      const splitText = doc.splitTextToSize(paragraph, pageWidth - margin * 2 - 8);
      doc.text(splitText, margin + 4, reportY);
      reportY += splitText.length * 3.5 + 1.5;
    });
  }

  // Footer Disclaimer
  doc.setTextColor(90, 98, 109);
  doc.setFontSize(6.5);
  doc.setFont('courier', 'normal');
  doc.text('ORBITAL DELTA - Hackathon prototype. AI results should be checked by a person.', margin, pageHeight - 6);
  doc.text('PAGE 01 / 01', pageWidth - margin - 18, pageHeight - 6);

  const fileId = result.id || 'OD';
  doc.save(`ORBITAL_DELTA_REPORT_${fileId}.pdf`);
}
