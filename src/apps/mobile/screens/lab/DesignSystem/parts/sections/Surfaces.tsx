/** Containers and lists: Panel, ListRow, Divider. */
import { Divider, Icon, ListRow, Panel } from '@mobile/ui';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

export function Surfaces() {
  return (
    <Section id="surfaces" title="Surfaces and lists" lede="Flat tonal layering: Paper on canvas outlined by a hairline, quiet Linen panels, and shadows only on what floats (sheets, toasts).">
      <Grid>


        <Specimen name="Panel" path="ui/Panel" note="No border, no side stripe. Semantic tones always carry an icon and words. goldRule = “A word from the Oracle”.">
          <Variant label="lilac"><Panel tone="lilac" icon="info"><p className="t-callout">The Oracle reads your profile before she answers.</p></Panel></Variant>
          <Variant label="success"><Panel tone="success" icon="success"><p className="t-callout">Profile saved.</p></Panel></Variant>
          <Variant label="warning"><Panel tone="warning" icon="alert"><p className="t-callout">One answer is missing.</p></Panel></Variant>
          <Variant label="danger"><Panel tone="danger" icon="alert"><p className="t-callout">We couldn’t read that file. Try a clearer photo.</p></Panel></Variant>
        </Specimen>

        <Specimen name="List" path="ui/ListRow">
          <div className={styles.listGroup}>
            <ListRow title="Text size" value="Default" onPress={() => {}} />
            <Divider />
            <ListRow leading={<Icon name="bell" />} title="Notifications" subtitle="Check-ins and reminders" onPress={() => {}} />
            <Divider />
            <ListRow leading={<Icon name="family" />} title="Family profiles" subtitle="2 of 4" onPress={() => {}} />
            <Divider />
            <ListRow title="Delete account" destructive trailing={null} onPress={() => {}} />
          </div>
        </Specimen>
      </Grid>
    </Section>
  );
}
