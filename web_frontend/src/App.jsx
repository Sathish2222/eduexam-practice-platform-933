import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminAddPaper from './pages/AdminAddPaper';
import AdminEditPaper from './pages/AdminEditPaper';
import StudentBrowse from './pages/StudentBrowse';
import PaperView from './pages/PaperView';
import ExamMode from './pages/ExamMode';
import StudyMode from './pages/StudyMode';
import AnswerKeyView from './pages/AnswerKeyView';
import AttemptHistory from './pages/AttemptHistory';
import SettingsPage from './pages/SettingsPage';
import ImportExportPage from './pages/ImportExportPage';
import { getPapers, addPaper, updatePaper } from './utils/storage';

// PUBLIC_INTERFACE
function App() {
  // Auto-load catalog.json on startup — loads/refreshes all papers from static files.
  // Runs every time the app starts; upserts papers so localStorage stays in sync with
  // the latest catalog (new allAnswerKeys, corrected URLs, etc.).
  useEffect(() => {
    const syncCatalog = async () => {
      try {
        const res = await fetch('/catalog.json');
        if (!res.ok) return;
        const catalog = await res.json();
        const existing = getPapers();
        const existingIds = new Set(existing.map(p => p.id));
        for (const p of catalog) {
          if (existingIds.has(p.id)) updatePaper(p.id, p);
          else addPaper(p);
        }
      } catch (e) {
        console.warn('Could not sync catalog:', e);
      }
    };
    syncCatalog();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Admin routes — kept but not shown in main nav */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/add" element={<AdminAddPaper />} />
        <Route path="/admin/edit/:paperId" element={<AdminEditPaper />} />
        {/* Student / Exam routes */}
        <Route path="/browse" element={<StudentBrowse />} />
        <Route path="/paper/:paperId" element={<PaperView />} />
        <Route path="/exam/:paperId" element={<ExamMode />} />
        <Route path="/study/:paperId" element={<StudyMode />} />
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
