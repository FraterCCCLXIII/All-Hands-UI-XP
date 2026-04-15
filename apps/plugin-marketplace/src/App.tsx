import { Navigate, Route, Routes } from 'react-router-dom';
import PluginListPage from './pages/PluginListPage';
import PluginDetailPage from './pages/PluginDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PluginListPage />} />
      <Route path="/plugins/:pluginId" element={<PluginDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
