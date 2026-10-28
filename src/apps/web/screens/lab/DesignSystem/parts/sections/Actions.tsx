/** Buttons and icon controls — the real ui primitives, every variant and state. */
import { useState } from 'react';
import { Button, GlassButton, IconButton, SocialButton } from '@web/ui';
import { Section } from '../Section';
import { Grid, Row, Specimen, Variant } from '../Specimen';

export function Actions() {
  const [loading, setLoading] = useState(false);
  const load = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1600);
  };
  return (
    <Section id="buttons" title="Buttons" lede="MUI Button anatomy (contained · outlined · text), skinned with Oracle tokens. One primary per view. The Oracle actions use the orb.">
      <Specimen name="Button" path="ui/Button" note="variant: primary · secondary · outline · ghost · link · destructive · emergency. size: lg · md · sm. Loading keeps the label and width.">
        <Variant label="primary"><Button fullWidth leadingIcon="deborah">Ask Oracle</Button></Variant>
        <Variant label="secondary"><Button variant="secondary" fullWidth>Not now</Button></Variant>
        <Variant label="outline"><Button variant="outline" fullWidth>Edit answers</Button></Variant>
        <Row>
          <Variant label="ghost"><Button variant="ghost">Skip</Button></Variant>
          <Variant label="link"><Button variant="link">Read more</Button></Variant>
          <Variant label="destructive"><Button variant="destructive">Delete note</Button></Variant>
        </Row>
        <Variant label="emergency"><Button variant="emergency" fullWidth leadingIcon="phone">Call 911</Button></Variant>
        <Row>
          <Variant label="size md"><Button size="md">Continue</Button></Variant>
          <Variant label="size sm"><Button size="sm" variant="secondary">Upgrade</Button></Variant>
          <Variant label="disabled"><Button disabled>Continue</Button></Variant>
        </Row>
        <Variant label="loading (tap)"><Button fullWidth loading={loading} onClick={load}>Save profile</Button></Variant>
      </Specimen>

      <Grid>
        <Specimen name="IconButton" path="ui/IconButton" note="Icon-only, always with an accessible label. 48 pt hit area at every size.">
          <Row>
            <Variant label="plain"><IconButton icon="more" label="More" /></Variant>
            <Variant label="accent"><IconButton icon="send" label="Send" tone="accent" /></Variant>
            <Variant label="tint"><IconButton icon="mic" label="Voice" tone="tint" /></Variant>
            <Variant label="surface"><IconButton icon="plus" label="Attach" tone="surface" /></Variant>
          </Row>
          <Row>
            <Variant label="sm"><IconButton icon="close" label="Close" size="sm" /></Variant>
            <Variant label="md"><IconButton icon="close" label="Close" size="md" /></Variant>
            <Variant label="lg"><IconButton icon="close" label="Close" size="lg" /></Variant>
          </Row>
        </Specimen>

        <Specimen name="GlassButton" path="ui/GlassButton" note="Floating controls over content (chat header, menu). Circle when icon-only.">
          <Row>
            <Variant label="icon"><GlassButton icon="menu" aria-label="Menu" /></Variant>
            <Variant label="icon"><GlassButton icon="back" aria-label="Back" /></Variant>
            <Variant label="label"><GlassButton icon="plus" label="New chat" /></Variant>
          </Row>
        </Specimen>

        <Specimen name="SocialButton" path="ui/SocialButton" note="Provider sign-in in their official looks (simulated, no auth).">
          <SocialButton provider="apple">Continue with Apple</SocialButton>
          <SocialButton provider="google">Continue with Google</SocialButton>
        </Specimen>
      </Grid>
    </Section>
  );
}
