import { useState, useRef, useEffect } from 'react';
import { FiDownload, FiZoomIn, FiZoomOut, FiMaximize, FiCheck, FiX } from 'react-icons/fi';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const DocumentTypes = [
  { id: 1, name: 'ID Card' },
  { id: 2, name: 'Passport' },
  { id: 3, name: 'Driver\'s License' },
  { id: 4, name: 'Education Certificate' },
  { id: 5, name: 'Employment Letter' }
];

const Candidates = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Robert Johnson' },
  { id: 4, name: 'Emily Davis' }
];

const VerifyDocument = () => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [notes, setNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentId, setDocumentId] = useState('DOC-2023-0015');
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const { user } = useUser();

  useEffect(() => {
    if (!file) return;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [file]);
  
  useEffect(() => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, PNG, or JPG');
      return;
    }
    
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB');
      return;
    }
    
    setError('');
    setFile(file);
    setUploadProgress(0);
  };

  const handleDownload = () => {
    if (!preview) return;
    
    const link = document.createElement('a');
    link.href = preview;
    link.download = file.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (previewRef.current.requestFullscreen) {
        previewRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleZoom = (zoomIn) => {
    setZoomLevel(prev => {
      if (zoomIn) return Math.min(prev + 10, 200);
      return Math.max(prev - 10, 50);
    });
  };

  const handleApprove = async () => {
    if (!file) {
      setUploadStatus({ 
        message: 'Please select a file to upload.', 
        type: 'error' 
      });
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      setUploadStatus({ 
        message: 'User email not found. Please sign in.', 
        type: 'error' 
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus({ message: 'Uploading document...', type: 'info' });

      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', user.primaryEmailAddress.emailAddress);
      
      // Add additional metadata if needed
      if (selectedDocType) formData.append('documentType', selectedDocType);
      if (selectedCandidate) formData.append('candidateId', selectedCandidate);
      if (notes) formData.append('notes', notes);
      formData.append('documentId', documentId);

      // Make the API request
      const response = await axios.post('http://localhost:3000/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Handle successful response
      setUploadStatus({
        message: `Document ${documentId} approved and uploaded successfully!`,
        type: 'success'
      });

      // Reset all form fields after successful upload
      setFile(null);
      setPreview('');
      setNotes('');
      setSelectedCandidate('');
      setSelectedDocType('');
      setUploadProgress(0);
      setError('');
      
      // Generate new document ID (simple increment for example)
      const newDocId = documentId.replace(/\d+$/, match => {
        const num = parseInt(match) + 1;
        return num.toString().padStart(match.length, '0');
      });
      setDocumentId(newDocId);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadStatus({
        message: `Upload failed: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = () => {
    // Here you would implement the rejection logic
    alert(`Document ${documentId} rejected`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[90vw] mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Verification</h1>
          
          {/* Display upload status messages */}
          {uploadStatus.message && (
            <div className={`mb-6 p-4 rounded-md ${
              uploadStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              uploadStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <p>{uploadStatus.message}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Document ID Display */}
            <div className="md:col-span-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <span className="text-sm text-gray-500">Document ID:</span>
                <span className="ml-2 font-medium text-gray-800">{documentId}</span>
              </div>
            </div>
            
            {/* User Email Display */}
            <div className="md:col-span-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <span className="text-sm text-gray-500">User Email:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {user?.primaryEmailAddress?.emailAddress || 'Not signed in'}
                </span>
              </div>
            </div>

            {/* Candidate Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Candidate
              </label>
              <select
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a candidate</option>
                {Candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Document Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select document type</option>
                {DocumentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center mb-6 transition-all
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
              ${file ? 'border-green-500' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, PNG or JPG (Max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Select File
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                
                {/* Upload Progress */}
                <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</span>
                
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                    setUploadProgress(0);
                  }}
                  className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 focus:outline-none"
                >
                  Remove
                </button>
              </>
            )}
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          {/* Document Preview */}
          {preview && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Document Preview</h2>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-end mb-2 space-x-2">
                  <button 
                    onClick={() => handleZoom(false)} 
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <FiZoomOut />
                  </button>
                  <button 
                    onClick={() => handleZoom(true)} 
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <FiZoomIn />
                  </button>
                  <button 
                    onClick={toggleFullscreen} 
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <FiMaximize />
                  </button>
                  <button 
                    onClick={handleDownload} 
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <FiDownload />
                  </button>
                </div>
                
                <div 
                  ref={previewRef} 
                  className="flex justify-center border border-gray-200 bg-white rounded overflow-hidden"
                  style={{ height: '400px' }}
                >
                  {file?.type.includes('pdf') ? (
                    <iframe 
                      src={preview} 
                      title="PDF Preview" 
                      className="w-full h-full"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                    />
                  ) : (
                    <img 
                      src={preview} 
                      alt="Document Preview"
                      className="object-contain max-h-full transition-all duration-200"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Verification Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about document verification..."
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleReject}
              disabled={isUploading}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
            >
              <FiX className="mr-2" />
              Reject Document
            </button>
            <button
              onClick={handleApprove}
              disabled={isUploading || !file}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Approve & Upload Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
