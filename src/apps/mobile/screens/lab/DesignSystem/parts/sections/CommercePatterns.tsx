/** Plans, products and family profiles used in V2. */
import { useState } from 'react';
import { PlanCard, ProductCard, ShopTiles } from '@mobile/patterns/commerce';
import { ProfileSwitcherList } from '@mobile/patterns/profile';
import { Segmented } from '@mobile/ui';
import { planList, productList } from '@shared/data';
import type { Billing } from '@shared/types/domain';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};
const PROFILES = [
  { id: 'p1', name: 'Maria', relationship: 'self' },
  { id: 'p2', name: 'Sofia', relationship: 'child' },
] as const;

export function CommercePatterns() {
  const [billing, setBilling] = useState<Billing>('annual');
  const [plan, setPlan] = useState(planList.find((p) => p.recommended)?.id ?? planList[0].id);
  const [active, setActive] = useState('p1');
  const product = productList[0];
  return (
    <Section id="commerce" title="Plans and family" lede="Plan radio cards, product cards, and the profile switcher — as used in V2 flows.">
      <Grid>
        <Specimen name="PlanCard" path="patterns/commerce/PlanCard" note="Price crossfades on billing change. Selected = accent outline.">
          <Segmented label="Billing" value={billing} onChange={setBilling} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]} />
          {planList.map((p) => <PlanCard key={p.id} plan={p} billing={billing} selected={plan === p.id} onSelect={() => setPlan(p.id)} />)}
        </Specimen>
        <Specimen name="ProductCard · ShopTiles" path="patterns/commerce/ProductCard" note="Answer §6 or the shop.">
          <Variant label="ProductCard">
            <div data-placeholder><ProductCard product={product} productRef={{ productId: product.id, why: product.tagline, frame90: 'Try it for 90 days, then check in.' }} onShop={noop} /></div>
          </Variant>
          <Variant label="ShopTiles"><ShopTiles title="Formulated by Genesis Health Products" products={productList.slice(0, 3)} onShop={noop} /></Variant>
        </Specimen>
        <Specimen name="ProfileSwitcherList" path="patterns/profile/ProfileSwitcherList" note="Initial, name, relationship, check on the active row.">
          <ProfileSwitcherList profiles={[...PROFILES]} activeId={active} addState="available" maxProfiles={4} onSelect={setActive} onAdd={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}