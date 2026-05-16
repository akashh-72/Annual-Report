import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUpload, FiX, FiFileText, FiLoader, FiArrowLeft, FiImage, 
  FiAward, FiUsers, FiSearch, FiPlus, FiInfo, FiCheckCircle, 
  FiAlertCircle, FiShield, FiAlertTriangle, FiEye, FiStar, FiZap,
  FiXCircle, FiRefreshCw, FiChevronRight, FiChevronLeft
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'academic',
    year: new Date().getFullYear(),
    achievementType: 'individual',
    hasCertificate: false
  });
  
  const [files, setFiles] = useState([]); // Array of { file, preview, status: 'pending'|'scanning'|'verified'|'flagged', result: null }
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  
  // Group-related state
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const searchTimeoutRef = useRef(null);
  const steps = [
    { id: 1, title: 'Basics', icon: FiFileText },
    { id: 2, title: 'Team', icon: FiUsers },
    { id: 3, title: 'Evidence', icon: FiImage },
    { id: 4, title: 'Finalize', icon: FiCheckCircle },
    { id: 5, title: 'Result', icon: FiAward }
  ];

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // --- Step 1 & 2 Logic ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  useEffect(() => {
    if (formData.achievementType === 'group' && allUsers.length === 0) {
      loadAllStudents();
    }
  }, [formData.achievementType]);

  const loadAllStudents = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/all-students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const filtered = (response.data || []).filter(u => u && u.id && u.id !== user?.id);
      setAllUsers(filtered);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Could not load student list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (searchQuery && allUsers.length > 0) {
      const queryLower = searchQuery.toLowerCase().trim();
      const filtered = allUsers.filter(u => 
        u.name?.toLowerCase().includes(queryLower) || 
        u.email?.toLowerCase().includes(queryLower) || 
        u.student_id?.toLowerCase().includes(queryLower)
      ).slice(0, 8);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allUsers]);

  const addMember = (m) => {
    if (groupMembers.find(member => member.id === m.id)) return toast.error('Already added');
    setGroupMembers([...groupMembers, m]);
    setSearchQuery('');
  };

  // --- Step 3 Logic: Images & Moderation ---
  const handleFileSelect = (selectedFiles) => {
    const newEntries = Array.from(selectedFiles).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      result: null
    }));
    setFiles(prev => [...prev, ...newEntries]);
  };

  const moderateImage = async (index) => {
    const fileEntry = files[index];
    if (!fileEntry || fileEntry.status === 'scanning' || fileEntry.status === 'verified') return;

    setFiles(prev => {
      const next = [...prev];
      next[index].status = 'scanning';
      return next;
    });

    const body = new FormData();
    body.append('file', fileEntry.file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/test/moderate-image`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFiles(prev => {
        const next = [...prev];
        next[index].status = response.data.status === 'accepted' ? 'verified' : 'flagged';
        next[index].result = response.data;
        return next;
      });

      if (response.data.status === 'rejected') {
        toast.error(`Image ${index + 1} flagged: ${response.data.verdict}`);
      } else {
        toast.success(`Image ${index + 1} verified!`);
      }
    } catch (error) {
      console.error('Moderation error:', error);
      setFiles(prev => {
        const next = [...prev];
        next[index].status = 'pending';
        return next;
      });
      toast.error('Moderation service unavailable.');
    }
  };

  const scanAll = async () => {
    const pendingIndices = files
      .map((f, i) => f.status === 'pending' || f.status === 'flagged' ? i : -1)
      .filter(i => i !== -1);
    
    if (pendingIndices.length === 0) return toast.success('All images are already processed.');
    
    for (const index of pendingIndices) {
      await moderateImage(index);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCertificateExtraction = async (file) => {
    if (!file) return;
    setExtracting(true);
    setCertificate(file);
    
    const body = new FormData();
    body.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/v1/activities/extract-details`, body, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      const { details } = response.data;
      setFormData(prev => ({
        ...prev,
        title: details.title || prev.title,
        type: details.type || prev.type,
        year: details.year || prev.year,
        description: details.description || prev.description,
        hasCertificate: true
      }));
      
      toast.success('Certificate verified and details extracted!');
      setShowPrompt(false);
    } catch (error) {
      console.error('Extraction error:', error);
      const serverDetail = error.response?.data?.detail;
      const msg = typeof serverDetail === 'string' ? serverDetail : 'Verification failed: Could not match identity or read text.';
      
      setVerificationError(msg);
      setCertificate(null);
    } finally {
      setExtracting(false);
    }
  };

  // --- Final submission ---
  const handleSubmit = async () => {
    // Check if any flagged images remain
    if (files.some(f => f.status === 'flagged')) {
        return toast.error('Please remove or replace flagged images before submitting.');
    }
    // Check if any remain unscanned
    if (files.some(f => f.status === 'pending')) {
        return toast.error('Please run the AI scan on all images first.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('type', formData.type);
      body.append('year', formData.year);
      body.append('achievement_type', formData.achievementType);
      
      if (formData.achievementType === 'group') {
        body.append('group_members', JSON.stringify(groupMembers.map(m => m.id)));
      }
      
      files.forEach(f => body.append('files', f.file));
      if (formData.hasCertificate && certificate) {
        body.append('certificate', certificate);
        body.append('has_certificate', 'true');
      }

      const loadingToast = toast.loading('AI is verifying your achievement...');
      const response = await axios.post(`${API_BASE_URL}/api/v1/activities/`, body, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minute timeout
      });
      toast.dismiss(loadingToast);

      setSubmissionResult(response.data);
      setCurrentStep(5);
      
      if (response.data.status === 'accepted') {
          toast.success('Achievement Verified & Published!');
      } else {
          toast('Manual Review Required', { icon: 'ℹ️' });
      }
    } catch (error) {
      toast.dismiss(); // Clear all loading toasts
      console.error('Submission error:', error);
      const serverError = error.response?.data?.error?.message || error.response?.data?.detail;
      toast.error(serverError || 'Failed to submit achievement. The server might be busy, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-8">
            <FiArrowLeft /> Save & Exit
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">New Achievement</h1>
                <p className="text-slate-500 font-medium tracking-tight">Step {currentStep} of 4: {steps[currentStep-1].title}</p>
            </div>
            
            {/* Stepper UI */}
            <div className="flex items-center gap-3">
                {steps.map(s => (
                    <div 
                        key={s.id}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                            currentStep === s.id ? 'bg-indigo-600 text-white shadow-lg' : 
                            currentStep > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                        {currentStep > s.id ? <FiCheckCircle /> : <s.icon />}
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex-1 p-8 md:p-12">
                {/* INITIAL PROMPT */}
                {showPrompt && !verificationError && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12 animate-in fade-in zoom-in duration-700">
                        <div className="text-center space-y-4 max-w-xl">
                            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 rotate-12">
                                <FiAward className="text-white text-4xl -rotate-12" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ready to share your achievement?</h2>
                            <p className="text-slate-500 font-medium text-lg">We can help you fill out the form automatically if you have a certificate.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                            <button 
                                onClick={() => { setFormData(p => ({...p, hasCertificate: false})); setShowPrompt(false); }}
                                className="group p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left space-y-4"
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <FiFileText className="text-2xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">No, I'll type it</h4>
                                    <p className="text-slate-500 font-bold text-sm uppercase tracking-tighter">Manual Entry</p>
                                </div>
                            </button>

                            <div className="relative group">
                                <input 
                                    type="file" id="prompt-cert-upload" className="hidden" 
                                    onChange={(e) => handleCertificateExtraction(e.target.files[0])}
                                    disabled={extracting}
                                />
                                <label 
                                    htmlFor="prompt-cert-upload"
                                    className={`block p-8 rounded-[2.5rem] border-2 border-indigo-600 bg-indigo-600 cursor-pointer hover:shadow-2xl hover:shadow-indigo-200 transition-all text-left space-y-4 ${extracting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                                        {extracting ? <FiLoader className="text-2xl animate-spin" /> : <FiUpload className="text-2xl" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white">Yes, I have one</h4>
                                        <p className="text-white/80 font-bold text-sm uppercase tracking-tighter">Auto-Fill with OCR</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                            <FiShield className="text-indigo-500" /> Secure AI Verification
                        </div>
                    </div>
                )}

                {/* VERIFICATION ERROR STATE */}
                {showPrompt && verificationError && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12 animate-in slide-in-from-top-4 duration-500">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner">
                            <FiXCircle className="text-4xl" />
                        </div>
                        
                        <div className="text-center space-y-3 max-w-lg">
                            <h3 className="text-3xl font-black text-slate-900">Identity Verification Failed</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {verificationError.includes('Identity mismatch') 
                                    ? "We found a name on this certificate that doesn't match your account. To maintain data integrity, we only accept certificates issued in your name."
                                    : verificationError}
                            </p>
                        </div>

                        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl w-full max-w-md">
                            <div className="flex items-start gap-4">
                                <FiInfo className="text-red-500 mt-1 shrink-0" />
                                <div className="text-sm">
                                    <p className="text-red-900 font-bold mb-1">System Detected:</p>
                                    <p className="text-red-700 italic">"{verificationError.split('Found text:')[1] || verificationError}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <button 
                                onClick={() => { setVerificationError(null); }}
                                className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                <FiRefreshCw /> Try Another File
                            </button>
                            <button 
                                onClick={() => { setVerificationError(null); setShowPrompt(false); setFormData(p => ({...p, hasCertificate: false})); }}
                                className="flex-1 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <FiChevronRight /> Manual Entry
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: BASICS */}
                {!showPrompt && currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {formData.hasCertificate && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 text-emerald-700 font-bold">
                                <FiCheckCircle className="text-xl shrink-0" />
                                <div>
                                    <p className="text-sm">Certificate Verified! We've pre-filled the details for you.</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Achievement Title</label>
                                <input 
                                    name="title" value={formData.title} onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                                    placeholder="Enter title (e.g. Smart India Hackathon Winner)"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Event Category</label>
                                <select 
                                    name="type" value={formData.type} onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                                >
                                    <option value="academic">Academic Excellence</option>
                                    <option value="technical">Technical Innovation</option>
                                    <option value="sports">Sports & Athletics</option>
                                    <option value="cultural">Cultural Arts</option>
                                    <option value="social">Social Service</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Detailed Description</label>
                            <textarea 
                                name="description" value={formData.description} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium min-h-[150px]"
                                placeholder="Describe your achievement, impact, and journey..."
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: TEAM */}
                {!showPrompt && currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="glass-morphism p-8 rounded-3xl border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
                            <div className={`p-4 rounded-2xl ${formData.achievementType === 'individual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                                <FiStar className="text-2xl" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-black text-slate-900">Individual or Group?</h3>
                                <p className="text-slate-500 font-medium">Is this a solo victory or a collaborative milestone?</p>
                            </div>
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button 
                                    onClick={() => setFormData(p => ({...p, achievementType: 'individual'}))}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${formData.achievementType === 'individual' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Solo
                                </button>
                                <button 
                                    onClick={() => setFormData(p => ({...p, achievementType: 'group'}))}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${formData.achievementType === 'group' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Group
                                </button>
                            </div>
                        </div>

                        {formData.achievementType === 'group' && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                    <input 
                                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                                        placeholder="Search by student name or ID..."
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-[110%] left-0 w-full bg-white rounded-3xl border border-slate-200 shadow-2xl py-2 z-50 overflow-hidden">
                                            {searchResults.map(res => (
                                                <button 
                                                    key={res.id} onClick={() => addMember(res)}
                                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{res.name.charAt(0)}</div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900">{res.name}</div>
                                                            <div className="text-xs text-slate-400">{res.department} • {res.student_id}</div>
                                                        </div>
                                                    </div>
                                                    <FiPlus className="text-indigo-600" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {groupMembers.map(m => (
                                        <div key={m.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{m.name.charAt(0)}</div>
                                                 <span className="font-bold text-slate-700">{m.name}</span>
                                             </div>
                                             <button onClick={() => setGroupMembers(p => p.filter(x => x.id !== m.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                 <FiX />
                                             </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: EVIDENCE / MODERATION */}
                {!showPrompt && currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div 
                            className={`border-4 border-dashed rounded-[2rem] p-12 transition-all text-center flex flex-col items-center justify-center min-h-[250px] ${
                                dragActive ? 'border-indigo-600 bg-indigo-50 scale-[1.01]' : 'border-slate-200 hover:border-indigo-400'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <FiUpload className="text-3xl" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Upload Visual Proof</h3>
                            <p className="text-slate-500 font-medium mb-6">Drag photos here or click to browse</p>
                            <input 
                                type="file" multiple className="hidden" id="upload-input" 
                                onChange={(e) => handleFileSelect(e.target.files)}
                            />
                            <label 
                                htmlFor="upload-input"
                                className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                            >
                                Browse Files
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        <FiShield className="text-indigo-600" /> AI Content Verification
                                    </h4>
                                    <button 
                                        onClick={scanAll}
                                        className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <FiZap className="w-3 h-3" /> Scan All Pending
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-slate-200 group">
                                            <img src={file.preview} className="w-full h-full object-cover transition-all group-hover:blur-sm" />
                                            
                                            {/* Status Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {file.status === 'pending' && (
                                                    <button onClick={() => moderateImage(idx)} className="p-4 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform">
                                                        <FiEye className="text-2xl" />
                                                    </button>
                                                )}
                                                {file.status === 'scanning' && <FiLoader className="text-white text-3xl animate-spin" />}
                                                {file.status === 'verified' && <FiCheckCircle className="text-emerald-400 text-4xl" />}
                                                {file.status === 'flagged' && <FiAlertTriangle className="text-red-400 text-4xl" />}
                                                
                                                <div className="mt-4 text-xs font-black text-white uppercase tracking-widest">{file.status}</div>
                                            </div>

                                            {/* Indicators */}
                                            <div className={`absolute top-4 left-4 w-3 h-3 rounded-full shadow-lg ${
                                                file.status === 'verified' ? 'bg-emerald-500' :
                                                file.status === 'flagged' ? 'bg-red-500' :
                                                file.status === 'scanning' ? 'bg-indigo-500' : 'bg-slate-300'
                                            }`} />

                                            <button 
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: REVIEW & CERTIFICATE */}
                {!showPrompt && currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 rounded-[2rem] bg-indigo-600 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-black mb-2">Final Step: Proof of Validation</h3>
                                <p className="opacity-80 font-medium">Do you have a certificate for this achievement?</p>
                            </div>
                            <div className="flex p-1 bg-white/20 rounded-2xl border border-white/30">
                                <button 
                                    onClick={() => setFormData(p => ({...p, hasCertificate: false}))}
                                    className={`px-6 py-3 rounded-xl font-extrabold transition-all ${!formData.hasCertificate ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}
                                >
                                    No
                                </button>
                                <button 
                                    onClick={() => setFormData(p => ({...p, hasCertificate: true}))}
                                    className={`px-6 py-3 rounded-xl font-extrabold transition-all ${formData.hasCertificate ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}
                                >
                                    Yes
                                </button>
                            </div>
                        </div>

                        {formData.hasCertificate && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Upload Original Certificate</label>
                                {!certificate ? (
                                    <div className="border-4 border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center border-slate-200">
                                        <input type="file" className="hidden" id="cert-input" onChange={(e) => setCertificate(e.target.files[0])} />
                                        <label htmlFor="cert-input" className="p-6 bg-indigo-50 text-indigo-600 rounded-3xl cursor-pointer hover:bg-indigo-100 transition-all">
                                            <FiUpload className="text-3xl" />
                                        </label>
                                        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">PDF or High-Res Image Only</p>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-3xl border border-indigo-200 bg-indigo-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <FiFileText className="text-indigo-600 text-xl" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900">{certificate.name}</div>
                                                <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Ready for OCR Validation</div>
                                            </div>
                                        </div>
                                        <button onClick={() => setCertificate(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <FiX />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200">
                             <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><FiInfo className="text-indigo-600" /> Review Summary</h4>
                             <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                                 <div className="p-4 rounded-2xl bg-white border border-slate-200">
                                     <span className="block text-slate-400 uppercase text-[10px] mb-1">Title</span>
                                     <span className="text-slate-700 truncate block">{formData.title || 'Untitled'}</span>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white border border-slate-200">
                                     <span className="block text-slate-400 uppercase text-[10px] mb-1">Type</span>
                                     <span className="text-slate-700 uppercase tracking-tighter">{formData.type}</span>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white border border-slate-200">
                                     <span className="block text-slate-400 uppercase text-[10px] mb-1">Impact Images</span>
                                     <span className="text-slate-700">{files.filter(f => f.status === 'verified').length} / {files.length} Verified</span>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white border border-slate-200">
                                     <span className="block text-slate-400 uppercase text-[10px] mb-1">Certificate</span>
                                     <span className={formData.hasCertificate ? 'text-emerald-600' : 'text-amber-600'}>{formData.hasCertificate ? 'Attached' : 'Not Provided'}</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: RESULT (Persistent on screen) */}
                {!showPrompt && currentStep === 5 && submissionResult && (
                    <div className="space-y-8 animate-in zoom-in duration-500">
                        <div className={`p-8 rounded-[2rem] text-center ${submissionResult.status === 'accepted' ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-amber-50 border-2 border-amber-100'}`}>
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${submissionResult.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {submissionResult.status === 'accepted' ? <FiCheckCircle className="text-4xl" /> : <FiAlertCircle className="text-4xl" />}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">
                                {submissionResult.status === 'accepted' ? 'Directly Approved!' : 'Pending Admin Review'}
                            </h2>
                            <p className="text-slate-600 font-medium max-w-md mx-auto">
                                {submissionResult.status === 'accepted' 
                                    ? 'Your certificate was successfully verified and your achievement is now public.' 
                                    : 'Your achievement was saved, but the certificate needs manual verification by an admin.'}
                            </p>
                        </div>

                        {/* Validation Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <FiShield className="text-indigo-600" /> Validation Report
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                                        <span className="text-sm font-bold text-slate-500">Name on Certificate</span>
                                        {submissionResult.certificate_validation_result?.name_matched ? (
                                            <span className="flex items-center gap-1 text-emerald-600 font-black text-sm"><FiCheckCircle /> MATCHED</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-500 font-black text-sm"><FiX /> NOT FOUND</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                                        <span className="text-sm font-bold text-slate-500">Activity Year ({submissionResult.year})</span>
                                        {submissionResult.certificate_validation_result?.year_matched ? (
                                            <span className="flex items-center gap-1 text-emerald-600 font-black text-sm"><FiCheckCircle /> MATCHED</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-500 font-black text-sm"><FiX /> NOT FOUND</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                                        <span className="text-sm font-bold text-slate-500">Keyword Match</span>
                                        <span className={`font-black text-sm ${submissionResult.certificate_validation_result?.match_percentage >= 0.5 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {((submissionResult.certificate_validation_result?.match_percentage || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    
                                    {submissionResult.certificate_validation_result?.year_matched === false && (
                                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 flex items-start gap-2">
                                            <FiAlertTriangle className="shrink-0 mt-0.5" />
                                            <span>Tip: The certificate shows a different year than what you entered ({submissionResult.year}). Double check the date on the certificate.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <FiInfo className="text-indigo-600" /> Details
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <span className="text-indigo-900 font-bold text-sm">Semantic Keyword Match</span>
                                        <span className={`px-4 py-1 rounded-full text-sm font-black ${submissionResult.certificate_validation_result?.match_percentage > 0.5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {Math.round((submissionResult.certificate_validation_result?.match_percentage || 0) * 100)}%
                                        </span>
                                    </div>

                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Found Keywords</div>
                                    <div className="flex flex-wrap gap-2">
                                        {submissionResult.certificate_validation_result?.found_keywords?.length > 0 ? (
                                            submissionResult.certificate_validation_result.found_keywords.map((kw, i) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold shadow-sm">
                                                    {kw}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-300 text-xs italic pl-1">No specific keywords matched (AI verified identity)</span>
                                        )}
                                    </div>
                                    
                                    {submissionResult.certificate_validation_result?.missing_keywords?.length > 0 && (
                                        <>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Missing Keywords</div>
                                            <div className="flex flex-wrap gap-2">
                                                {submissionResult.certificate_validation_result.missing_keywords.slice(0, 5).map((kw, i) => (
                                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-bold">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {submissionResult.certificate_validation_result?.reason && (
                            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100 italic text-center">
                                "{submissionResult.certificate_validation_result.reason}"
                            </div>
                        )}
                        
                        <div className="flex justify-center pt-4">
                            <button 
                                onClick={() => navigate('/activities')}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                Go to My Activities
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            {!showPrompt && currentStep < 5 && (
                <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
                        disabled={currentStep === 1}
                        className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-0"
                    >
                        Previous
                    </button>
                    
                    {currentStep < 4 ? (
                    <button 
                        onClick={() => setCurrentStep(p => p + 1)}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Save & Continue
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                    >
                        {loading ? <><FiLoader className="animate-spin" /> Finalizing...</> : <><FiAward /> Submit Entry</>}
                    </button>
                )}
            </div>
        )}
    </div>
</div>
    </div>
  );
};

export default CreateActivity;
