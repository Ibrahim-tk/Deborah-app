/** Value pickers used in V2 health basics: wheels and rulers (no unused OptionWheel / KnobSlider). */
import { useState } from 'react';
import { DateWheel, RulerSlider, YearWheel } from '@web/ui';
import { Section } from '../Section';
import { Grid, Specimen } from '../Specimen';

const inches = (v: number) => `${Math.floor(v / 12)}′ ${v % 12}″`;

export function Pickers() {
  const [year, setYear] = useState(1978);
  const [date, setDate] = useState('2026-09-28');
  const [height, setHeight] = useState(65);
  return (
    <Section id="pickers" title="Pickers" lede="Wheels and rulers used in V2 intake and health flows. Keyboard and screen-reader operable.">
      <Grid>
        <Specimen name="YearWheel" path="ui/YearWheel" note="Snap-scrolling year wheel; `cinematic` adds the 3D drum used in sign-up.">
          <YearWheel label="Year of birth" value={year} min={1930} max={2012} onChange={setYear} />
        </Specimen>
        <Specimen name="DateWheel" path="ui/DateWheel" note="Month · day · year wheels with a shared selection band.">
          <DateWheel label="First day of last period" value={date} minYear={2025} maxYear={2026} onChange={setDate} />
        </Specimen>
        <Specimen name="RulerSlider" path="ui/RulerSlider" note="Drag or scroll the ticks under a fixed marker.">
          <RulerSlider label="Height" value={height} min={48} max={84} onChange={setHeight} format={inches} />
        </Specimen>
      </Grid>
    </Section>
  );
}
