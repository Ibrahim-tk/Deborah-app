/** @shell VariantMenu — switches the design variation shown on Splash, Consent and Home. */
import { useShellStore, type DesignVariant } from '../../shell.store';
import { Popover } from '../Popover';
import { MenuItem, MenuSection } from '../MenuParts';

const VARIANTS: { value: DesignVariant; label: string; description: string }[] = [
  { value: 1, label: '1 · Original', description: 'Splash photo backdrop, as built' },
  { value: 2, label: '2 · Gradient shift', description: 'Slow-drifting violet and gold sky' },
  // OPEN: variations 3 and 4 not yet defined; they render the original until briefed.
  { value: 3, label: '3 · Not defined yet', description: 'Shows the original for now' },
  { value: 4, label: '4 · Not defined yet', description: 'Shows the original for now' },
];

export function VariantMenu() {
  const variant = useShellStore((s) => s.variant);
  const setVariant = useShellStore((s) => s.setVariant);

  return (
    <Popover trigger={<>Variation {variant}</>}>
      {(close) => (
        <MenuSection title="Splash · Consent · Home">
          {VARIANTS.map((v) => (
            <MenuItem
              key={v.value}
              label={v.label}
              description={v.description}
              active={v.value === variant}
              onSelect={() => { setVariant(v.value); close(); }}
            />
          ))}
        </MenuSection>
      )}
    </Popover>
  );
}
