import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

export default function SatAssessmentUploadForm({ onClose }) {
  const [file, setFile] = useState(null);
  const [sectionType, setSectionType] = useState('');
  const [satTitle, setSatTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  const normalizeSectionType = (label) => {
    switch (label) {
      case 'reading':
        return 'reading';
      case 'writing':
      case 'Writing & Language':
        return 'writing';
      case 'math_no_calc':
      case 'Math (No Calculator)':
        return 'math_no_calc';
      case 'math_calc':
      case 'Math (With Calculator)':
        return 'math_calc';
      case 'all':
        return 'all';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !satTitle || !sectionType) {
      alert('Please fill all fields and select a file.');
      return;
    }

    const teacherInfo = localStorage.getItem('teacherInfo')
      ? JSON.parse(localStorage.getItem('teacherInfo'))
      : null;
    const token = teacherInfo?.token;
    if (!token) {
      alert('Please log in again.');
      return;
    }

    const normalizedSectionType = normalizeSectionType(sectionType);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('satTitle', satTitle);
    formData.append('sectionType', normalizedSectionType);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sat-assessments/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('SAT Assessment uploaded!');
      console.log('Upload response:', response.data);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      const message =
        error.response?.data?.message || 'Upload failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SAT Paper Title</label>
        <input
          type="text"
          value={satTitle}
          onChange={(e) => setSatTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
        <select
          value={sectionType}
          onChange={(e) => setSectionType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Select Section</option>
          <option value="reading">Reading</option>
          <option value="writing">Writing & Language</option>
          <option value="math_no_calc">Math (No Calculator)</option>
          <option value="math_calc">Math (With Calculator)</option>
          <option value="all">All Sections</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload SAT PDF</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <label className="relative cursor-pointer text-blue-600 hover:text-blue-500">
              <span>Click to upload</span>
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept=".pdf,.md"
                required
              />
            </label>
            <p className="text-xs text-gray-500">PDF, MD only, max 10MB</p>
          </div>
        </div>
        {fileName && (
          <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileName('');
              }}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Uploading...' : 'Upload SAT Assessment'}
        </button>
      </div>
    </form>
  );
}
