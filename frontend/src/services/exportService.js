/**
 * Export Service - Handles data export in various formats
 * Follows clean code principles: Single Responsibility, Clear Naming, Separation of Concerns
 */

import html2canvas from 'html2canvas';

export class ExportService {
  /**
   * Export combinations data to CSV format
   * @param {Array} combinations - Array of combination objects
   * @param {string} filename - Name of the file to save
   */
  static exportToCSV(combinations, filename = 'combinations.csv') {
    if (!combinations || combinations.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(combinations[0]);
    const csvContent = this.generateCSVContent(combinations, headers);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export combinations data to PDF format
   * @param {Array} combinations - Array of combination objects
   * @param {Array} groupedCombinations - Grouped combinations data
   * @param {string} filename - Name of the file to save
   */
  static async exportToPDF(combinations, groupedCombinations, filename = 'combinations.pdf') {
    if (!combinations || combinations.length === 0) {
      throw new Error('No data to export');
    }

    try {
      // Dynamic import of jsPDF and autoTable
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Food Festival Vendor Distribution', 105, 20, { align: 'center' });
      
      // Add summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Total combinations: ${combinations.length}`, 20, 35);
      
      let yPosition = 50;
      
      // Process each group
      groupedCombinations.forEach((group, groupIndex) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add group header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Vendor = ${group.totalVendor}`, 20, yPosition);
        yPosition += 10;
        
        // Prepare table data with merged cells handling
        const tableHeaders = ['Number of vendor', 'Cuisine Type', 'Main Ingredient', 'No. of vendor per ingredient'];
        const tableData = [];
        
        group.cuisineGroups.forEach(cuisineGroup => {
          cuisineGroup.combinations.forEach((combo, index) => {
            const row = [
              index === 0 ? combo['Number of vendor'] : '', // Only show on first row of each cuisine
              index === 0 ? combo['Cuisene Type'] : '', // Only show on first row of each cuisine
              combo['Main Ingredient'],
              combo['No. of vendor per ingredient']
            ];
            tableData.push(row);
          });
        });
        
        // Add table using autoTable
        doc.autoTable({
          head: [tableHeaders],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          headStyles: {
            fillColor: [247, 211, 166], // #f7d3a6 in RGB
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 248, 248]
          },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.5,
          margin: { left: 20, right: 20 },
          didParseCell: function (data) {
            // Handle merged cells styling for both Number of vendor and Cuisine Type columns
            if ((data.column.index === 0 || data.column.index === 1) && data.cell.raw !== '') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [249, 249, 249];
            }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      });
      
      // Save the PDF
      doc.save(filename);
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }

  /**
   * Export table as image (PNG format)
   * @param {HTMLElement} tableElement - The table element to capture
   * @param {string} filename - Name of the file to save
   */
  static async exportToImage(tableElement, filename = 'combinations.png') {
    if (!tableElement) {
      throw new Error('Table element is required');
    }

    try {
      const imageData = await this.convertTableToImage(tableElement);
      this.downloadFile(imageData, filename, 'image/png');
    } catch (error) {
      throw new Error(`Failed to export image: ${error.message}`);
    }
  }

  /**
   * Generate CSV content from combinations data
   * @param {Array} combinations - Array of combination objects
   * @param {Array} headers - Array of header names
   * @returns {string} CSV content
   */
  static generateCSVContent(combinations, headers) {
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    combinations.forEach(combination => {
      const row = headers.map(header => {
        const value = combination[header];
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Convert table element to image data URL
   * @param {HTMLElement} tableElement - The table element to capture
   * @returns {Promise<string>} Image data URL
   */
  static async convertTableToImage(tableElement) {
    return new Promise((resolve, reject) => {
      try {
        // Create a container with proper styling
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.background = '#f7d3a6';
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Clone the table and add title
        const title = document.createElement('h2');
        title.textContent = '3-Wise Combinations';
        title.style.margin = '0 0 20px 0';
        title.style.color = '#333';
        title.style.textAlign = 'center';
        
        const clonedTable = tableElement.cloneNode(true);
        
        // Style the cloned table
        clonedTable.style.borderCollapse = 'collapse';
        clonedTable.style.width = '100%';
        clonedTable.style.backgroundColor = '#fff';
        clonedTable.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        
        // Style table cells
        const cells = clonedTable.querySelectorAll('th, td');
        cells.forEach(cell => {
          cell.style.border = '1px solid #aaa';
          cell.style.padding = '8px 16px';
          cell.style.textAlign = 'center';
          cell.style.fontSize = '14px';
        });
        
        // Style header cells
        const headerCells = clonedTable.querySelectorAll('th');
        headerCells.forEach(cell => {
          cell.style.backgroundColor = '#f7d3a6';
          cell.style.fontWeight = 'bold';
        });
        
        container.appendChild(title);
        container.appendChild(clonedTable);
        document.body.appendChild(container);
        
        // Use html2canvas if available, otherwise fallback to canvas
        if (typeof html2canvas !== 'undefined') {
          html2canvas(container, {
            backgroundColor: '#f7d3a6',
            scale: 2,
            useCORS: true,
            allowTaint: true
          }).then(canvas => {
            const imageData = canvas.toDataURL('image/png');
            document.body.removeChild(container);
            resolve(imageData);
          }).catch(error => {
            document.body.removeChild(container);
            reject(error);
          });
        } else {
          // Fallback to manual canvas drawing
          const canvas = this.drawTableToCanvas(clonedTable);
          const imageData = canvas.toDataURL('image/png');
          document.body.removeChild(container);
          resolve(imageData);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw table to canvas manually (fallback method)
   * @param {HTMLElement} tableElement - The table element to draw
   * @returns {HTMLCanvasElement} Canvas element with table image
   */
  static drawTableToCanvas(tableElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate dimensions
    const rows = tableElement.querySelectorAll('tr');
    const cols = rows[0]?.querySelectorAll('th, td') || [];
    const cellWidth = 120;
    const cellHeight = 40;
    const headerHeight = 50;
    
    canvas.width = cols.length * cellWidth + 40;
    canvas.height = rows.length * cellHeight + headerHeight + 40;
    
    // Draw background
    ctx.fillStyle = '#f7d3a6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('3-Wise Combinations', canvas.width / 2, 25);
    
    // Draw table
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, headerHeight, canvas.width - 40, canvas.height - headerHeight - 20);
    
    // Draw table content
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('th, td');
      const y = headerHeight + 20 + rowIndex * cellHeight;
      
      cells.forEach((cell, colIndex) => {
        const x = 20 + colIndex * cellWidth;
        
        // Draw cell border
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - 20, cellWidth, cellHeight);
        
        // Draw cell background for headers
        if (rowIndex === 0) {
          ctx.fillStyle = '#f7d3a6';
          ctx.fillRect(x, y - 20, cellWidth, cellHeight);
          ctx.fillStyle = '#333';
        }
        
        // Draw cell text
        ctx.fillText(cell.textContent, x + cellWidth / 2, y + 5);
      });
    });
    
    return canvas;
  }

  /**
   * Download file with given content and filename
   * @param {string} content - File content or data URL
   * @param {string} filename - Name of the file to save
   * @param {string} mimeType - MIME type of the file
   */
  static downloadFile(content, filename, mimeType) {
    // If content is a data URL (for images), download directly
    if (typeof content === 'string' && content.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = content;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    // Otherwise, treat as text/blob
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
} 