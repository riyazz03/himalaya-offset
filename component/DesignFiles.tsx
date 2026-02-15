import React from 'react';

interface DesignFile {
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  fileType?: string;
  uploadedAt?: string;
}

interface DesignFilesProps {
  files: DesignFile[];
  onDownload?: (file: DesignFile) => void;
}

export const DesignFiles: React.FC<DesignFilesProps> = ({ files, onDownload }) => {
  // ✅ FIXED: Add null/undefined check
  if (!files || files.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
        No files uploaded
      </div>
    );
  }

  // ✅ FIXED: Safely get file extension with fallback
  const getFileIcon = (fileName?: string): string => {
    if (!fileName) return '📄'; // Fallback for undefined fileName
    
    // ✅ Safe split with fallback
    const ext = fileName.split('.').pop()?.toLowerCase() || 'file'
    
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '🎯'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️'
      case 'zip':
      case 'rar':
      case '7z':
        return '🗜️'
      default:
        return '📎'
    }
  }

  // ✅ FIXED: Safe file size formatting
  const formatFileSize = (sizeInMB?: number): string => {
    if (!sizeInMB && sizeInMB !== 0) return 'Unknown'
    return `${sizeInMB.toFixed(2)} MB`
  }

  // ✅ FIXED: Safe date formatting
  const formatDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {files.map((file, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {/* File Icon */}
            <span style={{ fontSize: '24px' }}>
              {getFileIcon(file.fileName)}
            </span>

            {/* File Info */}
            <div style={{ flex: 1 }}>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                wordBreak: 'break-word',
              }}>
                {file.fileName || 'Unnamed file'}
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#6b7280',
              }}>
                {formatFileSize(file.fileSize)} {formatDate(file.uploadedAt) && `• ${formatDate(file.uploadedAt)}`}
              </p>
            </div>
          </div>

          {/* Download Button */}
          {file.fileUrl && onDownload && (
            <button
              onClick={() => onDownload(file)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2067ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                marginLeft: '12px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a52cc'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2067ff'
              }}
            >
              📥 Download
            </button>
          )}
        </div>
      ))}
    </div>
  )
}