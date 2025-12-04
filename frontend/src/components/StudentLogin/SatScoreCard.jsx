import React from "react";
import jsPDF from "jspdf";

const scaleToSAT = (raw, total) => {
  // very simple scale mapping → you can refine later with real SAT tables
  const percentage = (raw / total) * 100;
  if (percentage >= 90) return 750;
  if (percentage >= 80) return 700;
  if (percentage >= 70) return 650;
  if (percentage >= 60) return 600;
  if (percentage >= 50) return 550;
  if (percentage >= 40) return 500;
  if (percentage >= 30) return 450;
  if (percentage >= 20) return 400;
  return 350;
};

const SatScoreCard = ({ submission }) => {
  const { satTitle, sectionType, submission: sub } = submission;
  const { score, totalMarks, percentage } = sub;

  const scaledScore = scaleToSAT(score, totalMarks);
  const overall1600 = scaledScore * 2; // fake both sections, refine later

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SAT Score Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Title: ${satTitle}`, 20, 40);
    doc.text(`Section: ${sectionType}`, 20, 50);
    doc.text(`Raw Score: ${score} / ${totalMarks}`, 20, 60);
    doc.text(`Percentage: ${percentage}%`, 20, 70);
    doc.text(`Scaled Score (200-800): ${scaledScore}`, 20, 80);
    doc.text(`Estimated SAT (out of 1600): ${overall1600}`, 20, 90);

    doc.save(`${satTitle}-SAT-Report.pdf`);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        {satTitle} – {sectionType}
      </h2>
      <p className="text-gray-600">Raw Score: {score} / {totalMarks}</p>
      <p className="text-gray-600">Percentage: {percentage}%</p>
      <p className="text-gray-600">Scaled Score (200-800): {scaledScore}</p>
      <p className="text-gray-600 font-bold">
        Estimated SAT (out of 1600): {overall1600}
      </p>

      <button
        onClick={downloadPDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download Score Report
      </button>
    </div>
  );
};

export default SatScoreCard;
