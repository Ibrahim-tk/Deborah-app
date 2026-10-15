/** Value pickers used in health basics: wheels and sliders. */
import { useState } from 'react';
import { DateWheel, KnobSlider, RulerSlider, YearWheel } from '@flow-v1/apps/mobile/ui';
import { Section } from '../Section';
import { Grid, Specimen } from '../Specimen';

const inches = (v: number) => `${Math.floor(v / 12)}′ ${v % 12}″`;

export function Pickers() {
  const [year, setYear] = useState(1978);
  const [date, setDate] = useState('2026-09-28');
  const [height, setHeight] = useState(65);
  const [weight, setWeight] = useState(150);
  return (
    <Section id="pickers" title="Pickers" lede="iOS-style wheels and rulers for numbers people know roughly. Keyboard and screen-reader operable.">
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
        <Specimen name="KnobSlider" path="ui/KnobSlider" note="Large read-out above a slim track with one plain knob.">
          <KnobSlider label="Weight (lb)" value={weight} min={80} max={350} onChange={setWeight} />
        </Specimen>
      </Grid>
    </Section>
  );
}
