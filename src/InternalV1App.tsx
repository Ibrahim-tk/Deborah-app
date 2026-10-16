/**
 * Version 1 tools under `/internal` without editing the frozen versions/v1 route table.
 * Imports the frozen shell + styles via @flow-v1.
 */
import '@flow-v1/styles/index.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from '@flow-v1/shell/Shell';

export default function InternalV1App() {
  return (
    <Routes>
      <Route index element={<Navigate to="mobile" replace />} />
      <Route path="mobile" element={<Shell platform="mobile" />} />
      <Route path="web/*" element={<Shell platform="web" />} />
      <Route path="wid" element={<Shell platform="widgets" />} />
      <Route path="design-system" element={<Shell platform="design-system" />} />
      <Route path="*" element={<Navigate to="mobile" replace />} />
    </Routes>
  );
}
