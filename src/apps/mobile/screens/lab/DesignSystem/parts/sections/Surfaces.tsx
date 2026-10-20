/** Containers and lists: Card, Panel, ListRow, Divider, Sheet, Toast, Skeleton. */
import { useState } from 'react';
import { BottomSheet, Button, Card, Divider, Icon, ListRow, Panel, Sheet, Skeleton, Toast, type SheetHeight } from '@mobile/ui';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

function BottomSheetDemo() {
  const [open, setOpen] = useState<SheetHeight | null>(null);
  const heights: SheetHeight[] = ['auto', 'medium', 'large', '70%'];
  return (
    <>
      <div className={styles.listCard}>
        {heights.map((h) => (
          <ListRow key={String(h)} title={`height="${h}"`} onPress={() => setOpen(h)} />
        ))}
      </div>
      <BottomSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        height={open ?? 'auto'}
        title="Bottom sheet"
        footer={<Button fullWidth onClick={() => setOpen(null)}>Done</Button>}
      >
        <p className="t-callout">Drag down, tap outside or press Escape to close. Same interaction for every sheet.</p>
      </BottomSheet>
    </>
  );
}

export function Surfaces() {
  return (
    <Section id="surfaces" title="Surfaces and lists" lede="Flat tonal layering: Paper on canvas outlined by a hairline, quiet Linen panels, and shadows only on what floats (sheets, toasts).">
      <Grid>
        <Specimen name="BottomSheet" path="ui/BottomSheet" note="The one bottom sheet: scrim, spring slide, drag / flick / scrim tap / Escape to close, focus handling. height: auto (fits) · medium · large · px · %. variant: default · actions · system.">
          <BottomSheetDemo />
        </Specimen>

        <Specimen name="Card" path="ui/Card" note="tone: default · subtle · emphasis · danger. Pass onPress for a pressable card.">
          <Variant label="default"><Card><p className="t-headline">Your health profile</p><p className="t-callout">Four answers help Deborah tailor her reply.</p></Card></Variant>
          <Variant label="subtle"><Card tone="subtle"><p className="t-callout">A quieter grouping surface.</p></Card></Variant>
          <Variant label="emphasis · pressable"><Card tone="emphasis" onPress={() => {}}><p className="t-callout">Tap me: pressed feedback, no shadow.</p></Card></Variant>
          <Variant label="danger"><Card tone="danger"><p className="t-callout">Reserved for urgent safety moments.</p></Card></Variant>
        </Specimen>

        <Specimen name="Panel" path="ui/Panel" note="No border, no side stripe. Semantic tones always carry an icon and words. goldRule = “A Word from Deborah”.">
          <Variant label="linen · goldRule"><Panel goldRule><p className="t-body"><em>You are not broken. Your body is talking, and we are learning to listen.</em></p></Panel></Variant>
          <Variant label="lilac"><Panel tone="lilac" icon="info"><p className="t-callout">Deborah reads your profile before she answers.</p></Panel></Variant>
          <Variant label="success"><Panel tone="success" icon="success"><p className="t-callout">Profile saved.</p></Panel></Variant>
          <Variant label="warning"><Panel tone="warning" icon="alert"><p className="t-callout">One answer is missing.</p></Panel></Variant>
          <Variant label="danger"><Panel tone="danger" icon="alert"><p className="t-callout">We couldn’t read that file. Try a clearer photo.</p></Panel></Variant>
        </Specimen>

        <Specimen name="ListRow · Divider" path="ui/ListRow" note="≥ 56 pt; title headline, subtitle subhead; trailing chevron, value or custom. Hairlines inset 20 pt.">
          <div className={styles.listCard}>
            <ListRow title="Text size" value="Default" onPress={() => {}} />
            <Divider />
            <ListRow leading={<Icon name="bell" />} title="Notifications" subtitle="Check-ins and reminders" onPress={() => {}} />
            <Divider />
            <ListRow leading={<Icon name="family" />} title="Family profiles" subtitle="2 of 4" onPress={() => {}} />
            <Divider />
            <ListRow title="Delete account" destructive trailing={null} onPress={() => {}} />
          </div>
        </Specimen>

        <Specimen name="Sheet · Toast · Skeleton" path="ui/Sheet" note="Sheet: Paper, xl top corners, grabber, float-lg. Toast: Midnight, float-sm, 2.5 s. Skeleton: static Linen, no shimmer.">
          <Variant label="Sheet (static surface)">
            <div className={styles.sheetStage}>
              <Sheet title="Text size" footer={<Button fullWidth>Done</Button>}>
                <p className="t-callout">Make every word in the app larger or smaller.</p>
              </Sheet>
            </div>
          </Variant>
          <Variant label="Toast"><Toast message="Saved to Visit notes" /></Variant>
          <Variant label="Skeleton">
            <div className={styles.stack}>
              <Skeleton height={24} width="60%" />
              <Skeleton height={16} />
              <Skeleton height={16} width="80%" />
            </div>
          </Variant>
        </Specimen>
      </Grid>
    </Section>
  );
}
