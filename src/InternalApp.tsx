import '@styles/index.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from '@shell/Shell';

/** Version 2 prototype tools under `/internal` (gated by InternalGate in App). */
export default function InternalApp() {
  return (
    <Routes>
      <Route index element={<Navigate to="mobile" replace />} />
      <Route path="mobile" element={<Shell platform="mobile" />} />
      <Route path="web/*" element={<Shell platform="web" />} />
      <Route path="wid" element={<Shell platform="widgets" />} />
      <Route path="design-system" element={<Shell platform="design-system" />} />
      <Route path="email" element={<Shell platform="email" />} />
      <Route path="home" element={<Shell platform="home-lab" />} />
      <Route path="tree" element={<Shell platform="tree-lab" />} />
      <Route path="*" element={<Navigate to="mobile" replace />} />
    </Routes>
  );
}
