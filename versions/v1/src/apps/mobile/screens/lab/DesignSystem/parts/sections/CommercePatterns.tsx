/** Plans, products and family profiles. */
import { useState } from 'react';
import { PlanCard, ProductCard, ShopTiles } from '@flow-v1/apps/mobile/patterns/commerce';
import { ProfileBanner, ProfileSwitcherList } from '@flow-v1/apps/mobile/patterns/profile';
import { Segmented } from '@flow-v1/apps/mobile/ui';
import { planList, productList } from '@flow-v1/shared/data';
import type { Billing } from '@flow-v1/shared/types/domain';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};
const PROFILES = [
  { id: 'p1', name: 'Maria', relationship: 'self' },
  { id: 'p2', name: 'Sofia', relationship: 'daughter' },
] as const;

export function CommercePatterns() {
  const [billing, setBilling] = useState<Billing>('annual');
  const [plan, setPlan] = useState(planList.find((p) => p.recommended)?.id ?? planList[0].id);
  const [active, setActive] = useState('p1');
  const product = productList[0];
  return (
    <Section id="commerce" title="Plans, products and family" lede="Radio cards for plans (“Most chosen” as plain text), Deborah’s formulations as calm product cards, and the profile switcher.">
      <Grid>
        <Specimen name="PlanCard" path="patterns/commerce/PlanCard" note="Price crossfades on billing change. Selected = accent outline.">
          <Segmented label="Billing" value={billing} onChange={setBilling} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]} />
          {planList.map((p) => <PlanCard key={p.id} plan={p} billing={billing} selected={plan === p.id} onSelect={() => setPlan(p.id)} />)}
        </Specimen>
        <Specimen name="ProductCard · ShopTiles" path="patterns/commerce/ProductCard" note="Only inside answer §6 or the shop. Personal note in small text under the card.">
          <Variant label="ProductCard">
            <div data-placeholder><ProductCard product={product} productRef={{ productId: product.id, why: product.tagline, frame90: 'Try it for 90 days, then check in.' }} onShop={noop} /></div>
          </Variant>
          <Variant label="ShopTiles"><ShopTiles title="Formulated by Deborah" products={productList.slice(0, 3)} onShop={noop} /></Variant>
        </Specimen>
        <Specimen name="ProfileSwitcherList · ProfileBanner" path="patterns/profile/ProfileSwitcherList" note="Initial, name, relationship, check on the active row. The banner sits above a chat about someone else.">
          <ProfileSwitcherList profiles={[...PROFILES]} activeId={active} addState="available" maxProfiles={4} onSelect={setActive} onAdd={noop} />
          <ProfileBanner who="Daughter" minor onSwitch={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}
