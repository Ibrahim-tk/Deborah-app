import '@styles/index.css';
import { ClientShell } from '@shell/ClientShell';

/** Production-facing client page: Version 2 phone only, no prototype tooling chrome. */
export default function ClientApp() {
  return <ClientShell />;
}
