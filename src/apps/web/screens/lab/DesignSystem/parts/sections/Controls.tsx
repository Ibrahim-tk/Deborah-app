/** Choices and fields — one essential example of each. */
import { useState } from 'react';
import { Input, OptionList, OptionRow, Toggle } from '@web/ui';
import { PhoneField, type PhoneValue } from '@web/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen } from '../Specimen';

const SLEEP = ['Falling asleep', 'Waking at night', 'Waking too early'];

export function Controls() {
  const [single, setSingle] = useState('Waking at night');
  const [name, setName] = useState('');
  const [remind, setRemind] = useState(true);
  const [phone, setPhone] = useState<PhoneValue>({ countryCode: '+1', number: '' });

  return (
    <Section id="controls" title="Choices and fields" lede="Full-width option rows for choices; fields carry their label above.">
      <Grid>
        <Specimen name="Choice" path="ui/OptionRow">
          <OptionList label="Sleep">
            {SLEEP.map((o) => <OptionRow key={o} selected={single === o} onSelect={() => setSingle(o)}>{o}</OptionRow>)}
          </OptionList>
        </Specimen>
        <Specimen name="Text field" path="ui/Input">
          <Input label="First name" placeholder="Maria" value={name} onChange={(e) => setName(e.target.value)} />
        </Specimen>
        <Specimen name="Phone field" path="patterns/widgets/PhoneField">
          <PhoneField value={phone} onChange={setPhone} />
        </Specimen>
        <Specimen name="Toggle" path="ui/Toggle">
          <Toggle checked={remind} onChange={setRemind} label="Check-in reminders" description="A gentle nudge every two weeks." />
        </Specimen>
      </Grid>
    </Section>
  );
}
