/**
 * @screen  M-4.3 · Save your health history (create account / sign in)
 * @flow    F04 Free limit, plans & account (sign-in mode also from F01 M-1.2)
 * @states  choose · Apple/Google system sheet · email · verification code · verifying
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-43--save-your-health-history-create-account--sign-in
 * @xref    web: W-4.3 (apps/web/screens/plans/CreateAccount) — not built
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { Button, Header, IconButton, Input, Panel } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { CodeStep } from './parts/CodeStep';
import { ProviderSheet, type Provider } from './parts/ProviderSheet';
import styles from './CreateAccount.module.css';

type Step = 'choose' | 'email' | 'code';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateAccount() {
  const { mode = 'create', plan, billing, returnTo } = useScreenParams<{ mode: 'create' | 'signin'; plan: string; billing: string; returnTo: string }>();
  const { canGoBack, previousTitle } = useRoute();
  const { pop, dismissModal, presentSheet, resetTo } = useNav();
  const toast = useToast();
  const userName = useAppStore((s) => s.userName);
  const [step, setStep] = useState<Step>('choose');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [whyOpen, setWhyOpen] = useState(false);
  const signin = mode === 'signin';
  const handle = (userName || 'maria').toLowerCase().replace(/\s+/g, '.');

  // No real auth: success only writes the store (docs/ux/F04 M-4.3 acceptance).
  const succeed = (address: string) => {
    const s = useAppStore.getState();
    if (signin) {
      s.restoreAccount(address);
      resetTo('main', 'M-2.0');
      toast(`Welcome back, ${useAppStore.getState().userName}`);
    } else {
      s.createAccount(address);
      presentSheet('M-4.4', { plan, billing, returnTo });
    }
  };

  const submitEmail = () => {
    if (!EMAIL.test(email.trim())) return setEmailError('Enter an email address like maria@example.com.');
    setEmailError(undefined);
    setStep('code');
  };

  return (
    <div className={styles.root} data-xref="M-4.3 · Create account">
      <Header
        onBack={canGoBack ? (step === 'choose' ? pop : () => setStep(step === 'code' ? 'email' : 'choose')) : undefined}
        backLabel={step === 'choose' ? previousTitle : 'Back'}
        left={!canGoBack && step !== 'choose' ? <Button variant="link" onClick={() => setStep('choose')}>Back</Button> : undefined}
        right={!canGoBack && <IconButton icon="close" label="Close" onClick={dismissModal} />}
      />
      <div className={styles.body}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{signin ? 'Welcome back' : 'Save your health history'}</h1>
          <p className={styles.why}>
            {signin ? 'Sign in to pick up where you left off.' : 'Create an account so your consultations stay safe and come with you.'}
          </p>
        </div>

        {step === 'choose' && (
          <div className={styles.group}>
            <Button variant="secondary" fullWidth leadingIcon="apple" onClick={() => setProvider('apple')}>Continue with Apple</Button>
            <Button variant="secondary" fullWidth leadingIcon="google" onClick={() => setProvider('google')}>Continue with Google</Button>
            <Button variant="secondary" fullWidth leadingIcon="mail" onClick={() => setStep('email')}>Continue with email</Button>
            <Button variant="link" aria-expanded={whyOpen} onClick={() => setWhyOpen((o) => !o)}>Why do I need an account?</Button>
            {whyOpen && (
              <Panel icon="lock">
                <ul className={styles.list}>
                  <li>Your history syncs across your devices.</li>
                  <li>Everything is stored securely and encrypted.</li>
                  <li>{signin ? 'Your plan and conversations are restored.' : 'Your free consultations move with you.'}</li>
                </ul>
              </Panel>
            )}
          </div>
        )}

        {step === 'email' && (
          <form className={styles.group} onSubmit={(e) => {
            e.preventDefault();
            submitEmail();
          }} noValidate>
            <Input label="Email" type="email" autoComplete="email" placeholder={`${handle}@example.com`} autoFocus value={email} error={emailError} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" fullWidth>Continue</Button>
          </form>
        )}

        {step === 'code' && <CodeStep email={email.trim()} onVerified={() => succeed(email.trim())} />}
      </div>

      {provider && (
        <ProviderSheet
          provider={provider}
          email={`${handle}@${provider === 'apple' ? 'icloud.com' : 'gmail.com'}`}
          onCancel={() => setProvider(null)}
          onDone={(address) => {
            setProvider(null);
            succeed(address);
          }}
        />
      )}
    </div>
  );
}
