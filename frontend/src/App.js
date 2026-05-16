import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import CreateActivity from './pages/CreateActivity';
import EditActivity from './pages/EditActivity';
import ActivityDetail from './pages/ActivityDetail';
import Events from './pages/Events';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminActivities from './pages/admin/Activities';
import AdminEvents from './pages/admin/Events';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminNotifications from './pages/admin/Notifications';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Achievements from './pages/public/Achievements';
import PublicEvents from './pages/public/Events';
import Departments from './pages/public/Departments';
import Contact from './pages/public/Contact';
import Gallery from './pages/public/Gallery';
import PublicActivities from './pages/public/Activities';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/events/public" element={<PublicEvents />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/activities/public" element={<PublicActivities />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Redirect old dashboard to home */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                <Route path="/activities" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <Activities />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/activities/create" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <CreateActivity />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/activities/:id" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <ActivityDetail />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/activities/:id/edit" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <EditActivity />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/events" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <Events />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/admin/*" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="activities" element={<AdminActivities />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="/reports" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <Reports />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <div>
                      <Navbar />
                      <main className="min-h-screen bg-gray-50">
                        <Profile />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="/test-moderation" element={<Navigate to="/" replace />} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
