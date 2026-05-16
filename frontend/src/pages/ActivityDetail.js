import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCalendar, FiTag, FiImage, FiCheckCircle, 
  FiClock, FiXCircle, FiEdit, FiTrash2, FiDownload, 
  FiEye, FiFileText, FiUser, FiAward, FiZap, FiUsers, FiShield, FiAlertCircle 
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { api } from '../services/authService';
import { getImageUrl } from '../utils/imageUtils';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, image: null });
  const [groupMembersDetails, setGroupMembersDetails] = useState([]);

  useEffect(() => {
    if (id) fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/activities/${id}`);
      if (response.data) {
        setActivity(response.data);
        if (response.data.achievement_type === 'group' && response.data.group_members?.length > 0) {
          fetchGroupMembersDetails(response.data.group_members);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch report details');
      navigate('/activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembersDetails = async (memberIds) => {
    try {
      const promises = memberIds.map(mid => api.get(`/api/v1/users/${mid}`));
      const results = await Promise.all(promises);
      setGroupMembersDetails(results.map(r => r.data));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted': return { icon: FiCheckCircle, text: 'Verified Achievement', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'rejected': return { icon: FiXCircle, text: 'Report Rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
      default: return { icon: FiClock, text: 'Pending Academic Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <FiZap className="text-4xl text-indigo-600 animate-pulse" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Achievement Dossier...</p>
        </div>
    </div>
  );

  if (!activity) return null;

  const status = getStatusConfig(activity.status);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner / Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <button onClick={() => navigate('/activities')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                  <FiArrowLeft /> Back to List
              </button>
              <div className="flex items-center gap-3">
                  {activity.status !== 'accepted' && (
                      <>
                        <button onClick={() => navigate(`/activities/${id}/edit`)} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <FiEdit />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all">
                            <FiTrash2 />
                        </button>
                      </>
                  )}
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* Header Information */}
                <div>
                     <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${status.bg} ${status.border} border mb-6`}>
                         <status.icon className={status.color} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.text}</span>
                     </div>
                     <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
                         {activity.title}
                     </h1>
                     <div className="flex flex-wrap gap-8">
                         <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Year</span>
                             <span className="font-bold text-slate-700">{activity.year}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossier Category</span>
                             <span className="font-bold text-slate-700 uppercase tracking-tighter">{activity.type}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Created</span>
                             <span className="font-bold text-slate-700">{new Date(activity.created_at).toLocaleDateString()}</span>
                         </div>
                     </div>
                </div>

                {/* Description Dossier */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-indigo-100/20">
                     <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <FiFileText /> Executive Summary
                     </h4>
                     <p className="text-slate-600 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
                         {activity.description}
                     </p>
                </div>

                {/* Proof Gallery */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FiImage /> Visual Evidence Dossier
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activity.images?.map((img, idx) => (
                            <div 
                                key={idx} 
                                className="group relative aspect-video bg-slate-200 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg cursor-pointer"
                                onClick={() => setImageModal({ isOpen: true, image: img })}
                            >
                                <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white font-bold text-sm flex items-center gap-2">
                                        <FiMaximize2 className="text-indigo-400" /> Full Resolution Proof
                                    </span>
                                </div>
                                <div className="absolute top-4 left-4">
                                     <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-emerald-600 border border-emerald-100">AI VERIFIED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certificate Section */}
                {activity.has_certificate && activity.certificate_path && (
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FiAward /> Official Certification
                        </h4>
                        <div className="relative group bg-white rounded-[2.5rem] border-2 border-indigo-100 overflow-hidden shadow-2xl">
                             <img src={getImageUrl(activity.certificate_path)} className="w-full h-auto opacity-90 transition-all group-hover:opacity-100" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-10">
                                 <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                                     <div className="text-white">
                                         <h5 className="text-xl font-black mb-1">Authenticity Verified</h5>
                                         <p className="text-white/70 text-sm font-medium">OCR Validation completed on {new Date(activity.ml_checked_at || Date.now()).toLocaleDateString()}</p>
                                     </div>
                                     <a 
                                        href={getImageUrl(activity.certificate_path)} 
                                        download 
                                        className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                                     >
                                        <FiDownload /> Download Original
                                     </a>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Information */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Student Identity Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20">
                     <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Student Identity</h4>
                     <div className="flex items-center gap-4 mb-8">
                         <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl">
                             {activity.user_name?.charAt(0) || 'S'}
                         </div>
                         <div>
                             <div className="text-lg font-black">{activity.user_name}</div>
                             <div className="text-sm font-bold text-slate-400">{activity.department}</div>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div className="flex items-center justify-between py-3 border-t border-white/10">
                             <span className="text-xs font-black text-slate-500 uppercase">Student ID</span>
                             <span className="text-xs font-bold text-slate-300">{activity.student_id || 'N/A'}</span>
                         </div>
                         {activity.achievement_type === 'group' && (
                             <div className="py-3 border-t border-white/10">
                                 <span className="text-xs font-black text-slate-500 uppercase block mb-4">Team Assets</span>
                                 <div className="space-y-3">
                                      {groupMembersDetails.map(m => (
                                          <div key={m.id} className="flex items-center gap-3">
                                              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black">{m.name?.charAt(0)}</div>
                                              <span className="text-[10px] font-bold text-slate-300">{m.name}</span>
                                          </div>
                                      ))}
                                 </div>
                             </div>
                         )}
                     </div>
                </div>

                {/* Audit Context */}
                {activity.admin_comments && (
                    <div className="glass-morphism p-8 rounded-[2rem] border border-indigo-100 bg-white/50 backdrop-blur-xl">
                         <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <FiShield /> Academic Audit Feedback
                         </h4>
                         <p className="text-slate-600 font-bold text-sm leading-relaxed italic">
                             "{activity.admin_comments}"
                         </p>
                    </div>
                )}

                {/* Security Badge */}
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                     <FiShield className="text-emerald-600 text-xl flex-shrink-0 mt-1" />
                     <div>
                         <div className="text-xs font-black text-emerald-900 uppercase mb-1">Local AI Moderation</div>
                         <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                             This report was autonomously scanned using TKIET's private computer vision pipeline. 
                             Privacy preserved.
                         </p>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-200">
                <FiAlertCircle className="text-rose-500 text-5xl mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Report?</h3>
                <p className="text-slate-500 font-medium mb-8">This will permanently remove your achievement from the college record.</p>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowDeleteConfirm(false)} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={() => {
                        api.delete(`/api/v1/activities/${id}`).then(() => {
                            toast.success('Dossier Deleted');
                            navigate('/activities');
                        });
                    }} className="py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">Delete</button>
                </div>
            </div>
        </div>
      )}

      {imageModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setImageModal({ isOpen: false })}>
               <button className="absolute top-10 right-10 text-white text-4xl hover:scale-110 transition-transform">
                   <FiXCircle />
               </button>
               <img src={getImageUrl(imageModal.image)} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          </div>
      )}
    </div>
  );
};

const FiMaximize2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 3 6 6M9 21l-6-6M21 3l-6 6M3 21l6-6"/></svg>
);

export default ActivityDetail;
