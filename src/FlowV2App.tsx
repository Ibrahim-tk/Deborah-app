import '@styles/index.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from '@shell/Shell';

export default function FlowV2App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mobile" replace />} />
      <Route path="/mobile" element={<Shell platform="mobile" />} />
      <Route path="/web/*" element={<Shell platform="web" />} />
      <Route path="/wid" element={<Shell platform="widgets" />} />
      <Route path="/design-system" element={<Shell platform="design-system" />} />
      <Route path="*" element={<Navigate to="/mobile" replace />} />
    </Routes>
  );
}
