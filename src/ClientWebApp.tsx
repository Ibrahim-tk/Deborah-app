import '@styles/index.css';
import { ClientWebShell } from '@shell/ClientShell/ClientWebShell';

/** Client-facing web page at `/web`: Version 2 desktop app, no prototype tooling. */
export default function ClientWebApp() {
  return <ClientWebShell />;
}
