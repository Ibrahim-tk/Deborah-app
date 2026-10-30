/** Shared lower half of every home state (design 2026-10-21): Manage your health details · shop. */
import { RecommendationCard, SuggestionCarousel, type Recommendation } from '@mobile/patterns/widgets';

export type Destinations = [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];

export interface HomeSectionsProps {
  destinations: Destinations;
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  /** My Visit Notes card (M-9.1). */
  onNotes: () => void;
}

export function HomeSections({ destinations, recommendations, onShop, onNotes }: HomeSectionsProps) {
  // One Home lower half for every state (designer, 2026-10-21): health-detail cards + recommendations.
  return (
    <>
      <SuggestionCarousel
        label="Manage your health details"
        items={[
          { key: 'notes', title: 'My Visit Notes', sub: 'Saved notes', tone: 'lilac', artifact: 'blue-bloom', icon: 'note', onPress: onNotes },
          { key: 'health', title: 'My Health', sub: 'Your health profile', tone: 'mint', artifact: 'leaf-flower', icon: 'health', onPress: destinations[0].onPress },
          { key: 'family', title: 'My Family', sub: 'Family profiles', tone: 'rose', artifact: 'pink-bloom', icon: 'family', onPress: destinations[1].onPress },
        ]}
      />
      <RecommendationCard items={recommendations} onShop={onShop} />
    </>
  );
}
