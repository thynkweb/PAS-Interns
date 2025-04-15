import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Donations from './pages/Donations';
import Explore from './pages/Explore';
import Community from './pages/Community';
import Contact from './pages/Contact';
import CrowdfundingHacks from './pages/CrowdfundingHacks';
import Children from './pages/Children';
import ChildDetail from './pages/ChildDetail';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RankDetailPage from './pages/Rank';
import ModulePlayer from './pages/Module';
import ModuleDetailPage from './pages/ModuleDetail';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Navigate to="/" replace />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="insights" element={<Contact />} />
            <Route path="donations" element={<Donations />} />
            <Route path="explore" element={ <Explore />} />
            <Route path="community" element={<Community />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="hacks/:type" element={<CrowdfundingHacks />} />
            <Route path="children" element={<Children />} />
            <Route path="children/:id" element={<ChildDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/rank-details" element={<RankDetailPage />} />
            <Route path="/module/:moduleId" element={<ProtectedRoute><ModulePlayer /></ProtectedRoute>} />
            {/* <Route path="/module/:moduleId" element={<ProtectedRoute><ModulePlayer /></ProtectedRoute>} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;