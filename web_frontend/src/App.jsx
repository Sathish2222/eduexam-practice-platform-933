import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminAddPaper from './pages/AdminAddPaper';
import AdminEditPaper from './pages/AdminEditPaper';
import StudentBrowse from './pages/StudentBrowse';
import PaperView from './pages/PaperView';
import ExamMode from './pages/ExamMode';
import AnswerKeyView from './pages/AnswerKeyView';
import AttemptHistory from './pages/AttemptHistory';
import SettingsPage from './pages/SettingsPage';
import ImportExportPage from './pages/ImportExportPage';

/**
 * Main application component with all routes.
 * Provides routing between admin and student modes.
 */
// PUBLIC_INTERFACE
/**
 * Root App component that defines all application routes.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/add" element={<AdminAddPaper />} />
        <Route path="/admin/edit/:paperId" element={<AdminEditPaper />} />
        {/* Student routes */}
        <Route path="/browse" element={<StudentBrowse />} />
        <Route path="/paper/:paperId" element={<PaperView />} />
        <Route path="/exam/:paperId" element={<ExamMode />} />
        <Route path="/answer/:paperId" element={<AnswerKeyView />} />
        <Route path="/history" element={<AttemptHistory />} />
        {/* Settings & Data */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/import-export" element={<ImportExportPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
