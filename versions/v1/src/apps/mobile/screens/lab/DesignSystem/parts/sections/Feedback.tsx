/** Progress and presence: spinner, status line, bars and rings, Deborah's avatar and blob, the app bar. */
import { useEffect, useState } from 'react';
import { Avatar, DeborahBlob, Header, IconButton, ProgressBar, ProgressRing, ProgressStatus, Spinner } from '@flow-v1/apps/mobile/ui';
import { Section } from '../Section';
import { Grid, Row, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const STEPS = ['Reading your answers', 'Looking through my Handbook', 'Writing to you'];

export function Feedback() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => window.clearInterval(t);
  }, []);
  return (
    <Section id="feedback" title="Progress, presence and navigation" lede="A single rotating ring and words that change as steps complete; never typing dots. Deborah is always shown with her gold ring or her glass blob.">
      <Grid>
        <Specimen name="Spinner · ProgressStatus" path="ui/ProgressStatus" note="Status crossfades (160 ms) as steps change.">
          <Row>
            <Variant label="Spinner 16"><Spinner label="Loading" /></Variant>
            <Variant label="Spinner 24"><Spinner size={24} label="Loading" /></Variant>
          </Row>
          <Variant label="ProgressStatus (cycling)"><ProgressStatus label={STEPS[step]} /></Variant>
        </Specimen>

        <Specimen name="ProgressBar · ProgressRing" path="ui/ProgressBar" note="8 pt bar, value written beside it. Ring reads its percentage aloud.">
          <Variant label="ProgressBar"><ProgressBar value={12 / 90} label="90-day plan" valueText="Day 12 of 90" /></Variant>
          <Row>
            <Variant label="ProgressRing 44"><ProgressRing value={0.4} label="Profile complete" /></Variant>
            <Variant label="64"><ProgressRing value={0.75} size={64} label="Profile complete" /></Variant>
            <Variant label="no value"><ProgressRing value={0.25} showValue={false} label="Step 1 of 4" /></Variant>
          </Row>
        </Specimen>

        <Specimen name="Avatar · DeborahBlob" path="ui/Avatar" note="Profiles: Cormorant initial on Lilac. Deborah: portrait with a gold ring, or her glass blob (AI presence).">
          <Row>
            <Variant label="initial"><Avatar initial="Maria" size={40} /></Variant>
            <Variant label="initial 56"><Avatar initial="Sofia" size={56} /></Variant>
            <Variant label="Deborah · ring"><Avatar image="/images/deborah/portrait-placeholder.svg" ring size={40} label="Deborah" /></Variant>
          </Row>
          <Row>
            <Variant label="Blob 32"><DeborahBlob size={32} label="Deborah" /></Variant>
            <Variant label="Blob 56"><DeborahBlob size={56} label="Deborah" /></Variant>
            <Variant label="Blob 96"><DeborahBlob size={96} label="Deborah" /></Variant>
          </Row>
        </Specimen>

        <Specimen name="Header" path="ui/Header" note="Large title on tab roots (folds into the inline title on scroll); inline title with back on pushed screens.">
          <Variant label="inline · back">
            <div className={styles.headerStage}><Header title="Health profile" onBack={() => {}} backLabel="Account" safeTop={false} /></div>
          </Variant>
          <Variant label="large">
            <div className={styles.headerStage}><Header title="My Health" large safeTop={false} right={<IconButton icon="settings" label="Settings" />} /></div>
          </Variant>
        </Specimen>
      </Grid>
    </Section>
  );
}
