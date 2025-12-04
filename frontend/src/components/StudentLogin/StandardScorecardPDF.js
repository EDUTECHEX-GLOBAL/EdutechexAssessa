
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStandardScorecardPDF = (s) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Get student info from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const studentName = userInfo?.name || userInfo?.username || "Student";


  // === COLORS ===
  const darkTeal = [0, 77, 77];
  const lightTeal = [230, 247, 247];
  const green = [0, 128, 0];
  const red = [200, 0, 0];
  const gray = [100, 100, 100];

  const setColor = (c) => doc.setTextColor(...c);

  const margin = 15;
  const contentWidth = 180;
  let yPos = margin;

  // === HEADER ===
  try {
    doc.addImage("/assessa_logo.png", "PNG", margin, yPos, 30, 20);
  } catch (e) {
    doc.setFontSize(16);
    setColor(darkTeal);
    doc.setFont(undefined, "bold");
    doc.text("Assessa", margin, yPos + 10);
  }

  doc.setFontSize(18);
  setColor(darkTeal);
  doc.setFont(undefined, "bold");
  doc.text("Standard Assessment Report", margin + contentWidth / 2, yPos + 10, {
    align: "center",
  });

  yPos += 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 10;

  // === STUDENT INFO ===
  doc.setFontSize(11);
  setColor(darkTeal);
  doc.setFont(undefined, "bold");
  doc.text("Student:", margin, yPos);
  doc.setFont(undefined, "normal");
  doc.text(studentName, margin + 25, yPos);

  yPos += 7;
  doc.setFont(undefined, "bold");
  doc.text("Assessment:", margin, yPos);
  doc.setFont(undefined, "normal");
  doc.text(s.assessmentTitle || "—", margin + 30, yPos);

  yPos += 7;
  doc.setFont(undefined, "bold");
  doc.text("Date:", margin, yPos);
  doc.setFont(undefined, "normal");
  doc.text(
    s.date ? new Date(s.date).toLocaleDateString() : "—",
    margin + 20,
    yPos
  );

  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === SCORE SUMMARY ===
  doc.setFontSize(14);
  setColor(darkTeal);
  doc.setFont(undefined, "bold");
  doc.text("Score Summary", margin, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  setColor(gray);
  doc.text(`Score: ${s.score} / ${s.totalMarks}`, margin, yPos);
  yPos += 7;
  doc.text(`Percentage: ${s.percentage.toFixed(1)}%`, margin, yPos);

  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 15;

  // === DETAILED TABLE ===
  const tableHeaders = [["Assessment", "Score", "Total Marks", "Percentage", "Date"]];
  const tableData = [[
    s.assessmentTitle || "—",
    s.score || 0,
    s.totalMarks || 0,
    `${s.percentage.toFixed(1)}%`,
    s.date ? new Date(s.date).toLocaleDateString() : "—",
  ]];

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: darkTeal, textColor: 255 },
    bodyStyles: { fontSize: 10, cellPadding: 3 },
    styles: { halign: "center" },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 20;

  // === FOOTER ===
  doc.setFontSize(9);
  setColor(gray);
  doc.text(
    "This report summarizes your performance in the Standard Assessment.",
    margin,
    yPos
  );
  yPos += 5;
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);

  const filename = `Standard_Score_Report_${
    (s.assessmentTitle || "Assessment").replace(/\s+/g, "_")
  }.pdf`;

  doc.save(filename);
};

export default generateStandardScorecardPDF;
