import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
  onAnalyze: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingSettings, setProcessingSettings] = useState({
    batchSize: 100,
    includeMetadata: true,
    filterDuplicates: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0 || isUploading) return;
    setError(null);
    setIsUploading(true);

    try {
      const file = uploadedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('includeEmotions', 'true');
      formData.append('batchSize', String(processingSettings.batchSize));
      formData.append('textColumn', 'text');

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiBase}/api/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = res.data;
      const successful = (payload.results || []).filter((r: any) => !r.failed);
      const withSentiment = successful.filter((r: any) => r.sentiment && r.sentiment.confidence != null);

      const counts: Record<string, number> = {};
      withSentiment.forEach((r: any) => {
        const label = r.sentiment.label || 'unknown';
        counts[label] = (counts[label] || 0) + 1;
      });
      const majorityLabel = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'neutral';

      const avgConfidence = withSentiment.length > 0
        ? withSentiment.reduce((sum: number, r: any) => sum + (r.sentiment.confidence || 0), 0) / withSentiment.length
        : 0.5;

      const emotionSums: Record<string, number> = {};
      let emotionCount = 0;
      successful.forEach((r: any) => {
        if (Array.isArray(r.emotions)) {
          emotionCount++;
          r.emotions.forEach((e: any) => {
            const key = String(e.label || '').toLowerCase();
            const val = typeof e.percent === 'number' ? e.percent / 100 : (e.score ?? 0);
            if (!Number.isFinite(val)) return;
            emotionSums[key] = (emotionSums[key] || 0) + val;
          });
        }
      });
      const emotions: Record<string, number> = {};
      Object.entries(emotionSums).forEach(([k, v]) => {
        emotions[k] = emotionCount > 0 ? (v as number) / emotionCount : 0;
      });

      const unified = {
        id: payload.jobId || `file_${Date.now()}`,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'file',
        file: {
          name: payload.fileName,
          size: payload.fileSize,
        },
        sentiment: {
          label: majorityLabel,
          confidence: avgConfidence,
          scores: {},
        },
        emotions,
        summary: payload.summary || null,
        results: payload.results || [],
        processingTime: 0,
      };

      onAnalyze(unified);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'File upload failed';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-lg flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">File Upload</h3>
          <p className="text-gray-600 text-sm">Upload CSV, JSON, Excel, or text files for batch processing</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <motion.div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-gray-600 mb-4">
          or click to browse your files
        </p>
        <p className="text-sm text-gray-500">
          Supports CSV, JSON, Excel, and TXT files up to 10MB
        </p>
      </motion.div>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Processing Settings:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Batch Size
            </label>
            <select
              value={processingSettings.batchSize}
              onChange={(e) => setProcessingSettings(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={50}>50 items</option>
              <option value={100}>100 items</option>
              <option value={500}>500 items</option>
              <option value={1000}>1000 items</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="metadata"
              checked={processingSettings.includeMetadata}
              onChange={(e) => setProcessingSettings(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="metadata" className="text-xs text-gray-600">
              Include Metadata
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="duplicates"
              checked={processingSettings.filterDuplicates}
              onChange={(e) => setProcessingSettings(prev => ({ ...prev, filterDuplicates: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="duplicates" className="text-xs text-gray-600">
              Filter Duplicates
            </label>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleProcess}
        disabled={uploadedFiles.length === 0 || isUploading}
        className="w-full mt-6 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
        whileHover={{ scale: uploadedFiles.length > 0 ? 1.02 : 1 }}
        whileTap={{ scale: uploadedFiles.length > 0 ? 0.98 : 1 }}
      >
        <CheckCircle className="w-4 h-4" />
        <span>{isUploading ? 'Processing...' : `Process Files (${uploadedFiles.length})`}</span>
      </motion.button>
    </div>
  );
};

export default FileUpload;