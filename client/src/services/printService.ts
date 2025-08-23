import React from 'react';
import { renderToString } from 'react-dom/server';

export interface PrintOptions {
  title?: string;
  showPrintDialog?: boolean;
  printStyles?: string;
}

export const printReceipt = (receiptElement: HTMLElement) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Get the receipt template content
  const receiptContent = receiptElement.innerHTML;

  // Create the print document
  const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Finova Fitness - Receipt</title>
      <style>
        body {
          font-family: monospace;
          margin: 0;
          padding: 10px;
          background: white;
        }
        .receipt-template {
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.2;
        }
        @media print {
          body { margin: 0; }
          .receipt-template { 
            max-width: none;
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      ${receiptContent}
    </body>
    </html>
  `;

  // Write the content to the print window
  printWindow.document.write(printDocument);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
