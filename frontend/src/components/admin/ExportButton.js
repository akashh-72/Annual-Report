import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ExportButton = ({ data, filename = 'export', headers = [] }) => {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const convertToCSV = (data, headers) => {
    if (!data || data.length === 0) return '';
    
    const headerRow = headers.join(',');
    const rows = data.map(row => {
      return headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        let value = row[key] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [headerRow, ...rows].join('\n');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    try {
      setExporting(true);
      const csv = convertToCSV(data, headers);
      downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const handleExportJSON = () => {
    try {
      setExporting(true);
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;');
      toast.success('JSON exported successfully!');
    } catch (error) {
      toast.error('Failed to export JSON');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setExporting(true);
      // Simple Excel-compatible CSV with BOM for proper encoding
      const csv = '\uFEFF' + convertToCSV(data, headers);
      downloadFile(csv, `${filename}.xlsx`, 'application/vnd.ms-excel;charset=utf-8;');
      toast.success('Excel file exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center space-x-2"
      >
        <FiDownload className="h-4 w-4" />
        <span>Export</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
      >
        <FiDownload className="h-4 w-4" />
        <span>{exporting ? 'Exporting...' : 'Export'}</span>
      </button>
      
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
            >
              <span>📄</span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
            >
              <span>📊</span>
              <span>Export as Excel</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
            >
              <span>🔧</span>
              <span>Export as JSON</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

