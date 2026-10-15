import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flowVersionFrom, flowVersionHref } from '@shared/utils/flowVersion';

const Version1 = lazy(() => import('../versions/v1/src/App'));
const Version2 = lazy(() => import('./FlowV2App'));

/** Load only one complete source tree per document, including its styles and stores. */
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [version] = useState(() => flowVersionFrom(location.search));
  const scenario = useRef(new URLSearchParams(location.search).get('scenario'));
  useEffect(() => {
    // Existing platform links omit query parameters; retain the chosen flow and latest scenario.
    const params = new URLSearchParams(location.search);
    if (params.get('scenario')) scenario.current = params.get('scenario');
    else if (scenario.current) params.set('scenario', scenario.current);
    const target = flowVersionHref(location.pathname, params.toString(), location.hash, version);
    if (`${location.pathname}${location.search}${location.hash}` !== target) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate, version]);
  return <Suspense fallback={<p role="status">Loading Version {version === 'v1' ? '1' : '2'}…</p>}>
    {version === 'v1' ? <Version1 /> : <Version2 />}
  </Suspense>;
}
