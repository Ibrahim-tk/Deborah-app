/** Shared lower half of every home state (design 2026-10-20): records carousel · My health + Family · shop. */
import { PhotoDestinationPair, RecommendationCard, SuggestionCarousel, type Recommendation } from '@mobile/patterns/widgets';

type Link = { meta: string; onPress: () => void };
export type Destinations = [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];

export interface HomeSectionsProps {
  reports?: Link;
  documents?: Link;
  onLabs: () => void;
  destinations: Destinations;
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  /** First-time home: one row of what she already has (My Notes · My Health · My Family) instead of records + the pair. */
  onNotes?: () => void;
}

export function HomeSections({ reports, documents, onLabs, destinations, recommendations, onShop, onNotes }: HomeSectionsProps) {
  if (onNotes) {
    return (
      <>
        <SuggestionCarousel
          items={[
            { key: 'notes', title: 'My Notes', sub: 'Visit notes and saved answers', tone: 'lilac', artifact: 'blue-bloom', icon: 'note', onPress: onNotes },
            { key: 'health', title: 'My Health', sub: destinations[0].meta, tone: 'mint', artifact: 'leaf-flower', icon: 'health', onPress: destinations[0].onPress },
            { key: 'family', title: 'My Family', sub: destinations[1].meta, tone: 'rose', artifact: 'pink-bloom', icon: 'family', onPress: destinations[1].onPress },
          ]}
        />
        <RecommendationCard items={recommendations} onShop={onShop} />
      </>
    );
  }
  return (
    <>
      <SuggestionCarousel
        label="Your records"
        items={[
          { key: 'reports', title: 'Reports', sub: reports?.meta ?? 'None yet', tone: 'lilac', artifact: 'blue-bloom', icon: 'file', onPress: reports?.onPress ?? onLabs },
          { key: 'labs', title: 'Labs', sub: 'Upload your recent results', tone: 'sky', artifact: 'blue-bloom', icon: 'labs', onPress: onLabs },
          { key: 'documents', title: 'Documents', sub: documents?.meta ?? 'Upload and keep', tone: 'linen', artifact: 'pink-bloom', icon: 'note', onPress: documents?.onPress ?? onLabs },
        ]}
      />
      <PhotoDestinationPair
        tiles={[
          { title: destinations[0].title, meta: destinations[0].meta, tone: 'mint', artifact: 'dest-health-art', action: 'chevron', onPress: destinations[0].onPress },
          { title: destinations[1].title, meta: destinations[1].meta, tone: 'rose', artifact: 'dest-family-art', action: 'chevron', onPress: destinations[1].onPress },
        ]}
      />
      <RecommendationCard items={recommendations} onShop={onShop} />
    </>
  );
}
