// frontend/src/components/StudentLogin/ScorecardPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateScorecardPDF = (s) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Colors - Professional SAT color scheme
  const darkBlue = [0, 32, 91];
  const lightBlue = [225, 233, 246];
  const green = [0, 128, 0];
  const red = [200, 0, 0];
  const gray = [100, 100, 100];
  const darkGray = [50, 50, 50];

  const setColor = (colorArray) => {
    doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
  };

  // Margins and layout
  const margin = 15;
  const contentWidth = 180;
  let yPos = margin;

  // === HEADER WITH LOGO AND TITLE ===
  let logoAdded = false;
  const logoWidth = 30;
  const logoAspectRatio = 988 / 768;
  const logoHeight = logoWidth / logoAspectRatio;

  try {
    doc.addImage('/assessa_logo.png', 'PNG', margin, yPos, logoWidth, logoHeight);
    logoAdded = true;
  } catch (e) {
    doc.setFontSize(16);
    setColor(darkBlue);
    doc.setFont(undefined, 'bold');
    doc.text("Assessa", margin, yPos + logoHeight / 2);
  }

  doc.setFontSize(18);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("SAT Score Report", margin + contentWidth / 2, yPos + logoHeight / 2, { align: "center" });

  yPos += Math.max(logoHeight, 18) + 12;

  // Divider line below header
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 10;

  // === STUDENT INFO ===
  doc.setFontSize(11);
  setColor(darkGray);
  doc.setFont(undefined, 'bold');
  doc.text("Student:", margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(`${s.studentName || "—"}`, margin + 18, yPos);

  yPos += 7;
  doc.setFont(undefined, 'bold');
  doc.text("Email:", margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(`${s.studentEmail || "—"}`, margin + 18, yPos);

  yPos += 7;
  doc.setFont(undefined, 'bold');
  doc.text("Test Date:", margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(s.submittedDate ? new Date(s.submittedDate).toLocaleDateString() : "—", margin + 22, yPos);

  yPos += 15;

  // Divider line below student info
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === SECTION SCORES HEADER ===
  doc.setFontSize(16);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Section Scores", margin, yPos);

  yPos += 12;

  // === SECTION SCORES BOXES ===
  const rwScore = Math.round((s.percentage / 100) * 600 + 200);
  const mathScore = Math.round((s.percentage / 100) * 600 + 200);
  const sectionWidth = (contentWidth - 10) / 2;

  // Reading & Writing box
  doc.setFillColor(...lightBlue);
  doc.roundedRect(margin, yPos, sectionWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...darkBlue);
  doc.roundedRect(margin, yPos, sectionWidth, 50, 3, 3, 'S');

  doc.setFontSize(12);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Reading & Writing", margin + sectionWidth / 2, yPos + 10, { align: "center" });

  doc.setFontSize(20);
  doc.text(`${rwScore}`, margin + sectionWidth / 2, yPos + 30, { align: "center" });

  doc.setFontSize(10);
  if (rwScore >= 480) {
    setColor(green);
    doc.text("✓ Meets Benchmark", margin + sectionWidth / 2, yPos + 40, { align: "center" });
  } else {
    setColor(red);
    doc.text("✗ Below Benchmark", margin + sectionWidth / 2, yPos + 40, { align: "center" });
  }

  // Math box
  doc.setFillColor(...lightBlue);
  doc.roundedRect(margin + sectionWidth + 10, yPos, sectionWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...darkBlue);
  doc.roundedRect(margin + sectionWidth + 10, yPos, sectionWidth, 50, 3, 3, 'S');

  doc.setFontSize(12);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Math", margin + sectionWidth + 10 + sectionWidth / 2, yPos + 10, { align: "center" });

  doc.setFontSize(20);
  doc.text(`${mathScore}`, margin + sectionWidth + 10 + sectionWidth / 2, yPos + 30, { align: "center" });

  doc.setFontSize(10);
  if (mathScore >= 530) {
    setColor(green);
    doc.text("✓ Meets Benchmark", margin + sectionWidth + 10 + sectionWidth / 2, yPos + 40, { align: "center" });
  } else {
    setColor(red);
    doc.text("✗ Below Benchmark", margin + sectionWidth + 10 + sectionWidth / 2, yPos + 40, { align: "center" });
  }

  yPos += 65;

  // Divider line below section scores
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === PERCENTILE ===
  const percentile = s.percentage >= 80 ? 90 : s.percentage >= 50 ? 70 : 40;

  doc.setFontSize(12);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Percentile:", margin, yPos);
  doc.setFont(undefined, 'normal');
  setColor(darkGray);
  doc.text(`Your score is higher than ${percentile}% of students nationally`, margin + 25, yPos);

  yPos += 15;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === TOTAL SCORE ===
  const totalScaled = Math.round((s.percentage / 100) * 1200 + 400);

  doc.setFontSize(14);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Total Score", margin, yPos);

  doc.setFontSize(24);
  setColor(darkBlue);
  doc.text(`${totalScaled}`, margin + 60, yPos + 10);

  doc.setFontSize(10);
  setColor(gray);
  doc.text("(400-1600 scale)", margin + 60, yPos + 16);

  yPos += 30;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === SCORE DETAILS ===
  doc.setFontSize(14);
  setColor(darkBlue);
  doc.setFont(undefined, 'bold');
  doc.text("Score Details", margin, yPos);

  yPos += 6;

  const tableHeaders = [["Assessment", "Section", "Total Score", "Raw Score", "Percentage", "Date"]];
  const tableData = [[
    s.assessmentTitle || "—",
    s.sectionType || "—",
    `${totalScaled}`,
    s.score !== null && s.totalMarks !== null ? `${s.score} / ${s.totalMarks}` : "—",
    `${Number(s.percentage || 0).toFixed(1)}%`,
    s.submittedDate ? new Date(s.submittedDate).toLocaleDateString() : "—",
  ]];

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: darkBlue,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 20;

  // === BENCHMARK AND FOOTER TEXTS ===
  doc.setFontSize(9);
  setColor(gray);
  doc.setFont(undefined, 'italic');
  doc.text("Benchmark scores: Reading & Writing: 480, Math: 530", margin, yPos);

  yPos += 5;
  doc.text("The benchmark indicates college readiness. If you score at or above the benchmark,", margin, yPos);
  yPos += 4;
  doc.text("you're on track to be ready for college when you graduate.", margin, yPos);

  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);

  yPos += 10;
  doc.setFontSize(8);
  setColor(gray);
  doc.setFont(undefined, 'normal');
  doc.text("This score report is generated for practice SAT assessments within Assessa.", margin, yPos);

  yPos += 5;
  doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, margin, yPos);

  // Save PDF
  const filename = `SAT_Score_Report_${(s.assessmentTitle || 'Assessment').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

export default generateScorecardPDF;