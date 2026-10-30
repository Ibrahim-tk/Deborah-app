/**
 * @screen  M-10.2 · Privacy & data
 * @flow    F10 Account, privacy & data
 * @states  default · export requested ("Requested on {date}") · delete step 1 (SystemAlert) · delete step 2 (Type DELETE sheet)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695
 * @spec    docs/ux/F10-account-privacy.md#m-102--privacy--data
 * @xref    web: W-10.2 (apps/web/screens/account/PrivacyData) — not built
 */
import { useCallback, useState } from 'react';
import { selectIsTeenAccount, useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Divider, Icon, Header, ListRow, useAlert } from '@mobile/ui';
import { useNav, useRoute } from '@mobile/navigation';
import { DeleteConfirmSheet } from './parts/DeleteConfirmSheet';
import { RevokeConsentSheet } from './parts/RevokeConsentSheet';
import { useToast } from '@mobile/hooks/toast.store';
import styles from './PrivacyData.module.css';

export default function PrivacyData() {
  const nav = useNav();
  const { previousTitle } = useRoute();
  const alert = useAlert();
  const requestedAt = useAppStore((s) => s.settings.dataExportRequestedAt);
  const [confirming, setConfirming] = useState(false);
  const consentAt = useAppStore((s) => s.healthConsentAt);
  const teen = useAppStore(selectIsTeenAccount);
  const [revoking, setRevoking] = useState(false);
  const toast = useToast();
  const revoke = () => {
    useAppStore.getState().revokeHealthConsent();
    setRevoking(false);
    toast('Consent revoked');
  };
  const closeConfirm = useCallback(() => setConfirming(false), []);

  const download = async () => {
    const choice = await alert({
      title: 'Download my data',
      message: 'We’ll prepare your data and email you (demo).',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Request' }],
    });
    if (choice === 1) useAppStore.getState().requestExport();
  };

  const startDelete = async () => {
    const choice = await alert({
      title: 'Delete everything?',
      message: teen
        ? 'We’ll send a request to delete all of your information. It’s processed and certified within 30 days.'
        : 'Your account, every profile and all history will be deleted. Deletion is certified within 30 days.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Continue', style: 'destructive' }],
    });
    if (choice === 1) setConfirming(true);
  };

  const deleteAll = () => {
    setConfirming(false);
    useAppStore.getState().deleteAccount();
    nav.resetTo('preauth', 'M-1.1');
  };

  return (
    <div className={styles.root} data-xref="M-10.2 · Privacy & data">
      <Header title="Privacy & data" onBack={nav.pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <div className={styles.group}>
          <ListRow
            title="Download my data"
            subtitle={requestedAt ? `Requested on ${formatShortDate(requestedAt)}` : 'A copy of everything you’ve shared'}
            onPress={download}
          />
          {!teen && <Divider />}
          {!teen && <ListRow title="Delete a profile" subtitle="In Family profiles" onPress={() => nav.push('M-6.6')} />}
        </div>

        {/* Consent (design 2026-10-21): health-data consent can be revoked here; the next chat start asks again. */}
        {/* Teen accounts cannot revoke consent; they can delete everything (F06 teen invite). */}
        {!teen && <div className={styles.group}>
          <ListRow
            title="Health data consent"
            subtitle={consentAt ? `Given on ${formatShortDate(consentAt)}` : 'Not given — the Oracle will ask in chat'}
            onPress={consentAt ? () => setRevoking(true) : undefined}
            trailing={consentAt ? undefined : null}
          />
        </div>}

        {/* Open note on the canvas, no tinted panel (design 2026-10-21). */}
        <div className={styles.info}>
          <span className={styles.infoIcon} aria-hidden><Icon name="lock" size={18} /></span>
          <div>
            <p className={styles.infoTitle}>How your data is used</p>
            <p className={styles.infoText}>Your health information is never used for training without your consent.</p>
          </div>
        </div>

        <div className={styles.group}>
          <ListRow title={teen ? 'Request to delete all my information' : 'Delete my account and all data'} destructive trailing={null} onPress={startDelete} />
        </div>
        <p className={styles.note}>Deletion is certified within 30 days.</p>
      </div>
      <DeleteConfirmSheet open={confirming} onClose={closeConfirm} onConfirm={deleteAll} />
      <RevokeConsentSheet open={revoking} onClose={() => setRevoking(false)} onRevoke={revoke} />
    </div>
  );
}
