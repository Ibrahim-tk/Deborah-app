import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { InternalGate } from '@shell/InternalGate';
import { flowVersionFrom, flowVersionHref } from '@shared/utils/flowVersion';
import { legacyRedirectTarget } from '@shared/utils/internalPaths';
import ClientApp from './ClientApp';
import ClientWebApp from './ClientWebApp';
import { ClientEmailShell } from '@shell/ClientShell';

const InternalApp = lazy(() => import('./InternalApp'));
const InternalV1App = lazy(() => import('./InternalV1App'));

function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={legacyRedirectTarget(pathname, search, hash)} replace />;
}

/** Preserve `flow` + scenario on internal routes only. Client `/` never mounts Version 1. */
function InternalVersionLoader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [version] = useState(() => flowVersionFrom(location.search));
  const scenario = useRef(new URLSearchParams(location.search).get('scenario'));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scenario')) scenario.current = params.get('scenario');
    else if (scenario.current) params.set('scenario', scenario.current);
    const target = flowVersionHref(location.pathname, params.toString(), location.hash, version);
    if (`${location.pathname}${location.search}${location.hash}` !== target) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate, version]);

  return (
    <Suspense fallback={<p role="status">Loading Version {version === 'v1' ? '1' : '2'}…</p>}>
      {version === 'v1' ? <InternalV1App /> : <InternalApp />}
    </Suspense>
  );
}

function InternalSurface({ children }: { children: ReactNode }) {
  return <InternalGate>{children}</InternalGate>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientApp />} />
      {/* Client desktop web — no internal password gate. Internal tooling remains at /internal/web. */}
      <Route path="/web/*" element={<ClientWebApp />} />
      {/* Dummy inbox with the teen's invitation email (story 1.5). */}
      <Route path="/email" element={<ClientEmailShell />} />
      <Route
        path="/internal/*"
        element={
          <InternalSurface>
            <InternalVersionLoader />
          </InternalSurface>
        }
      />
      <Route path="/mobile" element={<LegacyRedirect />} />
      <Route path="/wid" element={<LegacyRedirect />} />
      <Route path="/design-system" element={<LegacyRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
