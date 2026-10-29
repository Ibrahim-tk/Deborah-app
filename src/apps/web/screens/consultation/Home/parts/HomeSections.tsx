/** Shared lower half of Home: health essentials (3) · more for you (full-width plan + two product cards). */
import { productList } from '@shared/data';
import { Button } from '@web/ui';
import { HealingPlanCard, SuggestionCarousel, type Recommendation } from '@web/patterns/widgets';
import layout from './HomeStates.module.css';

export type Destinations = [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];

export interface HomeSectionsProps {
  destinations: Destinations;
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  /** My Notes card (M-9.1). */
  onNotes: () => void;
  /** My Healing Plan entry for “More for you”. */
  journey?: { concern?: string; done: number; total: number; onPress: () => void };
  /** First-time users (no conversation yet): no product cards. */
  hideShop?: boolean;
}

export function HomeSections({ destinations, recommendations, onShop, onNotes, journey, hideShop }: HomeSectionsProps) {
  // Recommended first, then the catalogue, so there are always two cards.
  const products = [...recommendations.map((r) => r.product), ...productList]
    .filter((p, i, all) => p && all.findIndex((q) => q.id === p.id) === i)
    .slice(0, 2);
  return (
    <div className={layout.lower}>
      <SuggestionCarousel
        label="Manage your health details"
        layout="essentials"
        items={[
          {
            key: 'notes',
            title: 'My Notes',
            sub: 'Saved notes',
            tone: 'lilac',
            artifact: 'blue-bloom',
            icon: 'note',
            onPress: onNotes,
          },
          {
            key: 'health',
            title: 'My Health',
            sub: 'Your health profile',
            tone: 'mint',
            artifact: 'leaf-flower',
            icon: 'health',
            onPress: destinations[0].onPress,
          },
          {
            key: 'family',
            title: 'My Family',
            sub: 'Family profiles',
            tone: 'rose',
            artifact: 'pink-bloom',
            icon: 'family',
            onPress: destinations[1].onPress,
          },
        ]}
      />

      {(journey || !hideShop) && (
      <section className={layout.more} aria-label="Recommended for you">
        {/* No plan before the first conversation, so no card (no locked placeholder). */}
        {journey && <HealingPlanCard concern={journey.concern} done={journey.done} total={journey.total} onPress={journey.onPress} />}
        {/* Two tall store-style product cards (image on top, name, Shop). */}
        {!hideShop && (
        <div className={layout.productGrid}>
          {products.map((p) => (
            <article key={p.id} className={layout.product}>
              <button type="button" className={layout.productWell} aria-label={p.name} onClick={() => onShop(p.id)}>
                <img src={p.image} alt="" className={layout.productImage} />
              </button>
              <div className={layout.productCopy}>
                <h3 className={layout.productName}>{p.name}</h3>
                <p className={layout.productTag}>{p.tagline}</p>
              </div>
              <Button variant="secondary" size="sm" leadingIcon="shop" onClick={() => onShop(p.id)}>Shop</Button>
            </article>
          ))}
        </div>
        )}
      </section>
      )}
    </div>
  );
}
