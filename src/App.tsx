import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from '@shell/Shell';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mobile" replace />} />
      <Route path="/mobile" element={<Shell platform="mobile" />} />
      <Route path="/web/*" element={<Shell platform="web" />} />
      <Route path="*" element={<Navigate to="/mobile" replace />} />
    </Routes>
  );
}
