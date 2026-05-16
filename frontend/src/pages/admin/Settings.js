import React, { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiBell, FiShield, FiDatabase, FiMail, FiRefreshCw, FiServer, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'TKIET Warananagar',
    siteEmail: 'admin@tkiet.edu.in',
    maxFileSize: '10',
    autoApprove: false,
    emailNotifications: true,
    requireApproval: true,
    allowStudentEdit: true,
    enableMLValidation: true
  });

  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Settings saved successfully!');
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="settings-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['settings-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Settings
                </span>
                <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center border border-blue-400/30">
                  <FiSettings className="mr-1.5 h-3 w-3" />
                  Configuration
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">System Settings</h1>
              <p className="text-blue-100 text-lg">Configure system preferences and options</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div 
          data-animate
          id="general-settings"
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-1000 delay-100 ${isVisible['general-settings'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <FiSettings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-500">Basic system configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleChange('siteEmail', e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleChange('maxFileSize', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div 
          data-animate
          id="notif-settings"
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-1000 delay-150 ${isVisible['notif-settings'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
              <FiBell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Email and alert preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all group">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Email Notifications</p>
                <p className="text-sm text-gray-600">Send email updates to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-600 shadow-lg"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Management Settings */}
        <div 
          data-animate
          id="activity-settings"
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-1000 delay-200 ${isVisible['activity-settings'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Activity Management</h3>
              <p className="text-sm text-gray-500">Activity approval settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Require Approval</p>
                <p className="text-sm text-gray-600">Activities need admin approval</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={(e) => handleChange('requireApproval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-600 peer-checked:to-green-600 shadow-lg"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Allow Student Edit</p>
                <p className="text-sm text-gray-600">Students can edit activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowStudentEdit}
                  onChange={(e) => handleChange('allowStudentEdit', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-lg"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Enable ML Validation</p>
                <p className="text-sm text-gray-600">Use ML for certificate verification</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableMLValidation}
                  onChange={(e) => handleChange('enableMLValidation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-red-600 shadow-lg"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div 
          data-animate
          id="system-info"
          className={`bg-gradient-to-br from-slate-700 to-gray-800 rounded-2xl shadow-2xl p-6 text-white hover:shadow-3xl transition-all duration-1000 delay-250 ${isVisible['system-info'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <FiDatabase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System Information</h3>
              <p className="text-sm text-gray-300">Server and database details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-2">
                <FiServer className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Version</span>
              </div>
              <span className="text-sm font-bold text-white">1.0.0</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-2">
                <FiDatabase className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Database</span>
              </div>
              <span className="text-sm font-bold text-white">MongoDB</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-2">
                <FiLock className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Environment</span>
              </div>
              <span className="text-sm font-bold text-white">Production</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all">
              <div className="flex items-center space-x-2">
                <FiRefreshCw className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-gray-300">Last Backup</span>
              </div>
              <span className="text-sm font-bold text-white">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div 
        data-animate
        id="additional-settings"
        className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-8 transition-all duration-1000 delay-300 ${isVisible['additional-settings'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <FiSettings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
            <p className="text-sm text-gray-600">System configuration and tips</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <FiShield className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Security</h4>
            <p className="text-sm text-gray-600">All data is encrypted and secure</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg">
              <FiDatabase className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Backups</h4>
            <p className="text-sm text-gray-600">Automatic backups every 6 hours</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 shadow-lg">
              <FiBell className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Alerts</h4>
            <p className="text-sm text-gray-600">Real-time system notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
