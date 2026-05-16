import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUpload, FiX, FiFileText, FiLoader, FiCheckCircle, FiXCircle, FiArrowLeft, FiImage, FiAward, FiFileText as FiDoc, FiUsers, FiSearch, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const EditActivity = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'academic',
    date: new Date().toISOString().split('T')[0],
    achievementType: 'individual',
    hasCertificate: false
  });
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  
  // Group achievement state
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch existing activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/v1/activities/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const activity = response.data;
        
        // Parse date from activity
        const activityDate = activity.date ? new Date(activity.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          type: activity.type || 'academic',
          date: activityDate,
          achievementType: activity.achievement_type || 'individual',
          hasCertificate: activity.has_certificate || false
        });
        
        setExistingImages(activity.images || []);
        
        // Load group members if it's a group achievement
        if (activity.achievement_type === 'group' && activity.group_members) {
          setGroupMembers(activity.group_members);
        }
        
      } catch (error) {
        console.error('Error fetching activity:', error);
        toast.error('Failed to load activity details');
        navigate('/activities');
      } finally {
        setFetching(false);
      }
    };
    
    fetchActivity();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleCertificateSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      toast.error('Certificate must be an image or PDF file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Certificate file is too large (max 15MB)');
      return;
    }

    setCertificate(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCertificate = () => {
    setCertificate(null);
  };

  // Group achievement handlers
  const handleSearchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/v1/users/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSearchResults(response.data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery) {
        handleSearchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const addGroupMember = (user) => {
    if (groupMembers.some(m => m.id === user.id)) {
      toast.error('User already added');
      return;
    }
    setGroupMembers([...groupMembers, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeGroupMember = (userId) => {
    setGroupMembers(groupMembers.filter(m => m.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (existingImages.length === 0 && files.length === 0) {
      toast.error('Please upload at least one image or keep existing images');
      return;
    }

    if (formData.achievementType === 'group' && groupMembers.length === 0) {
      toast.error('Please add at least one group member for group achievements');
      return;
    }

    if (formData.hasCertificate && !certificate && !existingImages.find(img => img.is_certificate)) {
      toast.error('Please upload a certificate or keep the existing one');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to edit an activity');
        navigate('/login');
        return;
      }
      
      const formDataToSend = new FormData();
      const dateObj = new Date(formData.date);
      const year = dateObj.getFullYear();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('year', year);
      formDataToSend.append('achievement_type', formData.achievementType);
      
      if (formData.achievementType === 'group' && groupMembers.length > 0) {
        const memberIds = groupMembers.map(m => m.id);
        formDataToSend.append('group_members', JSON.stringify(memberIds));
      }
      
      formDataToSend.append('has_certificate', formData.hasCertificate);
      
      // Add new files
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      // Add new certificate if provided
      if (certificate) {
        formDataToSend.append('certificate', certificate);
      }
      
      const response = await axios.put(`http://localhost:8000/api/v1/activities/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Activity updated successfully!');
      navigate(`/activities/${id}`);
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      if (error.response?.data?.error?.code === 'CERTIFICATE_VALIDATION_FAILED') {
        const errorData = error.response.data.error;
        const details = errorData.details || {};
        
        let errorMessage = errorData.message || 'Certificate does not match your activity details';
        
        if (details.reason) {
          errorMessage = details.reason;
        }
        
        if (details.missing_keywords && details.missing_keywords.length > 0) {
          const missing = details.missing_keywords.slice(0, 5).join(', ');
          errorMessage += ` Missing keywords: ${missing}`;
        }
        
        toast.error(errorMessage, { 
          duration: 8000,
          style: {
            maxWidth: '600px',
            whiteSpace: 'pre-wrap'
          }
        });
      } else {
        const message = error.response?.data?.detail || error.response?.data?.error?.message || 'Failed to update activity';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading activity details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/activities/${id}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Activity
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Edit Your Achievement
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Update your achievement details. Changes will be reviewed.
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiDoc className="h-6 w-6 mr-3 text-blue-600" />
            Achievement Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="form-label">
                Achievement Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="form-input"
                placeholder="e.g., Won First Prize in Coding Competition"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="type" className="form-label">
                Achievement Category *
              </label>
              <select
                id="type"
                name="type"
                required
                className="form-input"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="academic">Academic Excellence</option>
                <option value="technical">Technical Innovation</option>
                <option value="cultural">Cultural & Arts</option>
                <option value="sports">Sports & Fitness</option>
                <option value="social">Social Service</option>
              </select>
            </div>
          </div>

          {/* Achievement Type Selection */}
          <div className="mt-6">
            <label className="form-label">Achievement Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({...formData, achievementType: 'individual'});
                  setGroupMembers([]);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.achievementType === 'individual'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.achievementType === 'individual' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.achievementType === 'individual' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-gray-900">Individual</div>
                    <div className="text-sm text-gray-500">Personal achievement</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, achievementType: 'group'})}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.achievementType === 'group'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.achievementType === 'group' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.achievementType === 'group' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-gray-900">Group</div>
                    <div className="text-sm text-gray-500">Team achievement</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Group Members Selection */}
          {formData.achievementType === 'group' && (
            <div className="mt-6">
              <label className="form-label flex items-center">
                <FiUsers className="h-5 w-5 mr-2 text-blue-600" />
                Add Group Members *
              </label>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  ref={searchRef}
                  className="form-input pl-12"
                  placeholder="Search by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => addGroupMember(result)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {result.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{result.name}</div>
                          <div className="text-sm text-gray-500">{result.department}</div>
                        </div>
                        <FiPlus className="h-5 w-5 text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {groupMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Added Members ({groupMembers.length})
                  </div>
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{member.department || ''}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGroupMember(member.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <label htmlFor="description" className="form-label">
              Achievement Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="form-input"
              placeholder="Describe your achievement in detail..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="mt-6">
            <label htmlFor="date" className="form-label">
              Achievement Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              max={new Date().toISOString().split('T')[0]}
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Certificate Option */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiAward className="h-6 w-6 mr-3 text-yellow-600" />
            Certificate Verification
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hasCertificate"
                name="hasCertificate"
                checked={formData.hasCertificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasCertificate" className="text-sm font-medium text-gray-700 cursor-pointer">
                I have a certificate for this achievement
              </label>
            </div>

            {formData.hasCertificate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="mt-4">
                  {!certificate && !existingImages.find(img => img.is_certificate) ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleCertificateSelect}
                        className="hidden"
                        id="certificate-upload"
                      />
                      <label
                        htmlFor="certificate-upload"
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 cursor-pointer"
                      >
                        <FiUpload className="h-4 w-4 mr-2" />
                        Upload Certificate (Image or PDF)
                      </label>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-blue-200 p-4 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FiFileText className="h-6 w-6 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {certificate ? certificate.name : 'Existing certificate'}
                            </p>
                          </div>
                        </div>
                        {certificate && (
                          <button
                            type="button"
                            onClick={removeCertificate}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiImage className="h-6 w-6 mr-3 text-purple-600" />
            Achievement Evidence (Images)
          </h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Drop Zone */}
          <div
            className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
              <FiUpload className="h-10 w-10 text-blue-600" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                Drop your images here or click to browse
              </p>
              <p className="text-gray-600 text-lg">
                Support for JPG, PNG, GIF formats up to 10MB each
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-6 inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FiUpload className="h-5 w-5 mr-2" />
              Add More Images
            </label>
          </div>

          {/* New File List */}
          {files.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">
                  {files.length}
                </span>
                New Images to Add
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-700 shadow-lg"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                    <div className="mt-3">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/activities/${id}`)}
            className="px-8 py-4 bg-gray-200 text-gray-800 font-bold text-lg rounded-xl hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 inline-flex items-center"
          >
            {loading ? (
              <>
                <FiLoader className="h-5 w-5 mr-3 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Achievement'
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default EditActivity;

