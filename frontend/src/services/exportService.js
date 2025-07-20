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
   * Export combinations data to text format
   * @param {Array} combinations - Array of combination objects
   * @param {string} filename - Name of the file to save
   */
  static exportToText(combinations, filename = 'combinations.txt') {
    if (!combinations || combinations.length === 0) {
      throw new Error('No data to export');
    }

    const textContent = this.generateTextContent(combinations);
    this.downloadFile(textContent, filename, 'text/plain');
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
   * Generate text content from combinations data
   * @param {Array} combinations - Array of combination objects
   * @returns {string} Formatted text content
   */
  static generateTextContent(combinations) {
    if (combinations.length === 0) return 'No combinations generated.';
    
    const headers = Object.keys(combinations[0]);
    const textLines = [];
    
    // Add title
    textLines.push('3-Wise Combinations Report');
    textLines.push('='.repeat(30));
    textLines.push(`Total combinations: ${combinations.length}`);
    textLines.push('');
    
    // Add header row
    textLines.push(headers.join('\t'));
    textLines.push('-'.repeat(headers.join('\t').length));
    
    // Add data rows
    combinations.forEach((combination, index) => {
      const row = headers.map(header => combination[header]);
      textLines.push(row.join('\t'));
    });
    
    return textLines.join('\n');
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