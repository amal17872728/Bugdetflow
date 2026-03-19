import React from 'react';
import jsPDF from 'jspdf';

const ExportPDF = ({ transactions }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('BudgetFlow - Transactions Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Financial Summary', 20, 40);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    doc.setFontSize(10);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 20, 50);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, 57);
    doc.text(`Current Balance: $${balance.toFixed(2)}`, 20, 64);
    
    doc.setFillColor(41, 128, 185);
    doc.rect(20, 75, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Date', 25, 80);
    doc.text('Description', 50, 80);
    doc.text('Category', 100, 80);
    doc.text('Type', 140, 80);
    doc.text('Amount', 165, 80);
    
    let yPosition = 90;
    doc.setTextColor(0, 0, 0);
    
    transactions.forEach((transaction) => {
    
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;

        doc.setFillColor(41, 128, 185);
        doc.rect(20, yPosition, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Date', 25, yPosition + 5);
        doc.text('Description', 50, yPosition + 5);
        doc.text('Category', 100, yPosition + 5);
        doc.text('Type', 140, yPosition + 5);
        doc.text('Amount', 165, yPosition + 5);
        yPosition += 15;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(transaction.date, 25, yPosition);
      doc.text(transaction.description.substring(0, 20), 50, yPosition);
      doc.text(transaction.category, 100, yPosition);
      doc.text(transaction.type, 140, yPosition);
      
      if (transaction.type === 'income') {
        doc.setTextColor(0, 128, 0); 
      } else {
        doc.setTextColor(255, 0, 0); 
      }
      doc.text(`$${Math.abs(transaction.amount).toFixed(2)}`, 165, yPosition);
      doc.setTextColor(0, 0, 0); 
      yPosition += 7;
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    doc.save(`budgetflow-transactions-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button onClick={generatePDF} className="btn-pdf">
       Export to PDF
    </button>
  );
};

export default ExportPDF;