/** Choices and fields — option rows (never chips), text fields, checkbox, toggle, segmented, select. */
import { useState } from 'react';
import { Checkbox, ChoiceGroup, Input, OptionList, OptionRow, Segmented, Select, TextArea, Toggle } from '@mobile/ui';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const AGES = ['Under 30', '30–39', '40–49', '50–59', '60+', 'Prefer not to say'];
const SLEEP = ['Falling asleep', 'Waking at night', 'Waking too early'];

export function Controls() {
  const [single, setSingle] = useState('Waking at night');
  const [multi, setMulti] = useState<string[]>(['Falling asleep']);
  const [age, setAge] = useState('40–49');
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [agree, setAgree] = useState(true);
  const [remind, setRemind] = useState(true);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [when, setWhen] = useState<'m' | 'a' | 'e' | undefined>();
  const toggle = (o: string) => setMulti((m) => (m.includes(o) ? m.filter((x) => x !== o) : [...m, o]));

  return (
    <Section id="controls" title="Choices and fields" lede="Option rows replace chips everywhere: full width, at least 56 pt, a check on the selected row. Fields carry their label above and name the fix when something is wrong.">
      <Grid>
        <Specimen name="OptionRow · OptionList" path="ui/OptionRow" note="Single (radio) and multi (checkbox) rows. Action rows omit `selected`; navigational rows show a chevron.">
          <Variant label="single">
            <OptionList label="Sleep">
              {SLEEP.map((o) => <OptionRow key={o} selected={single === o} onSelect={() => setSingle(o)}>{o}</OptionRow>)}
            </OptionList>
          </Variant>
          <Variant label="multi">
            <OptionList label="Sleep, choose any" multi>
              {SLEEP.map((o) => <OptionRow key={o} multi selected={multi.includes(o)} onSelect={() => toggle(o)}>{o}</OptionRow>)}
            </OptionList>
          </Variant>
          <Variant label="action · chevron · disabled">
            <OptionList>
              <OptionRow leadingIcon="calendar" chevron onSelect={() => {}}>Book a consultation</OptionRow>
              <OptionRow leadingIcon="upload" disabled>Upload labs</OptionRow>
            </OptionList>
          </Variant>
        </Specimen>

        <Specimen name="OptionList grid2 · ChoiceGroup" path="ui/OptionList" note="Two columns for up to six short answers. ChoiceGroup: a compact row of one-tap answers.">
          <Variant label="grid2">
            <OptionList label="Age" layout="grid2">
              {AGES.map((o) => <OptionRow key={o} selected={age === o} onSelect={() => setAge(o)}>{o}</OptionRow>)}
            </OptionList>
          </Variant>
          <Variant label="ChoiceGroup · fill">
            <ChoiceGroup label="Sex at birth" fill value={sex} onChange={setSex} choices={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]} />
          </Variant>
        </Specimen>

        <Specimen name="Input · TextArea (Base UI Field)" path="ui/Input" note="Built on MUI Base UI Field, styled with our tokens. Label above in subhead; focus = accent border; error names the problem and the fix.">
          <Variant label="default"><Input label="First name" placeholder="Maria" value={name} onChange={(e) => setName(e.target.value)} /></Variant>
          <Variant label="hint"><Input label="Email" type="email" placeholder="maria@example.com" hint="We only use this to save your profile." /></Variant>
          <Variant label="error"><Input label="Year of birth" defaultValue="19" error="Enter all four digits, like 1978." /></Variant>
          <Variant label="password (eye toggle)"><Input label="Password" type="password" placeholder="Enter your password" /></Variant>
          <Variant label="leading · trailing"><Input label="Weight" placeholder="150" leading="lb" trailing={<span>kg?</span>} /></Variant>
          <Variant label="disabled"><Input label="Email" defaultValue="maria@example.com" disabled /></Variant>
          <Variant label="TextArea (grows 1–5 lines)"><TextArea label="Note" placeholder="Add a note for the Oracle…" value={note} onChange={(e) => setNote(e.target.value)} minRows={2} maxRows={5} /></Variant>
        </Specimen>

        <Specimen name="Checkbox · Toggle · Segmented · Select" path="ui/Checkbox" note="Whole row tappable. Toggle on = accent. Segmented: Linen track, Paper selected segment.">
          <Variant label="Checkbox"><Checkbox checked={agree} onChange={setAgree} label="I understand this is education, not medical care" description="You can change this any time in Account." /></Variant>
          <Variant label="Toggle"><Toggle checked={remind} onChange={setRemind} label="Check-in reminders" description="A gentle nudge every two weeks." /></Variant>
          <Variant label="Segmented">
            <Segmented label="Billing" value={billing} onChange={setBilling} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]} />
          </Variant>
          <Variant label="Select">
            <Select label="Best time to reach you" value={when} onChange={setWhen} options={[{ value: 'm', label: 'Morning' }, { value: 'a', label: 'Afternoon' }, { value: 'e', label: 'Evening' }]} />
          </Variant>
        </Specimen>
      </Grid>
    </Section>
  );
}
