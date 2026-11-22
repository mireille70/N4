import type { SectionBlock } from '@/content/home';
import { Hero } from './Hero';
import { MascotHero } from './MascotHero';
import { WallHero } from './WallHero';
import { DeckHero } from './DeckHero';
import { TunnelHero } from './TunnelHero';
import { GiftHero } from './GiftHero';
import { FeatureCards } from './FeatureCards';
import { CategoryRail } from './CategoryRail';
import { PopularGrid } from './PopularGrid';
import { ProductSlider } from './ProductSlider';
import { PlatformsBoard } from './PlatformsBoard';
import { OffersSection } from './OffersSection';
import { ArrivalsRail } from './ArrivalsRail';
import { ShoppingCards } from './ShoppingCards';
import { ReviewsSection } from './ReviewsSection';
import { CategoryShowcase } from './CategoryShowcase';
import { VoiceProducts } from './VoiceProducts';
import { PromoBanner } from './PromoBanner';

/**
 * Maps a content block to its section component. Section index numbers
 * ("02", "03"…) are derived from position so reordering stays consistent.
 */
export function SectionRenderer({ blocks }: { blocks: SectionBlock[] }) {
  let n = 0;
  return (
    <>
      {blocks.map((b) => {
        const index = b.type === 'hero' || b.type === 'wall-hero' || b.type === 'deck-hero' || b.type === 'tunnel-hero' || b.type === 'gift-hero' || b.type === 'mascot-hero' || b.type === 'features' || b.type === 'categories' || b.type === 'promo' ? undefined : String(++n).padStart(2, '0');
        switch (b.type) {
          case 'voice':
            return <VoiceProducts key={b.id} id={b.id} title={b.title} items={b.items} index={index} />;
          case 'promo':
            return <PromoBanner key={b.id} id={b.id} slides={b.slides} />;
          case 'hero':
            return <Hero key={b.id} slides={b.slides} promos={b.promos} />;
          case 'gift-hero':
            return <GiftHero key={b.id} slides={b.slides} />;
          case 'tunnel-hero':
            return <TunnelHero key={b.id} slides={b.slides} />;
          case 'deck-hero':
            return <DeckHero key={b.id} slides={b.slides} />;
          case 'wall-hero':
            return <WallHero key={b.id} slides={b.slides} />;
          case 'mascot-hero':
            return <MascotHero key={b.id} content={b.content} />;
          case 'features':
            return <FeatureCards key={b.id} items={b.items} />;
          case 'categories':
            // category tiles show without a visible heading (kept for screen readers)
            return <CategoryRail key={b.id} title={b.title} hideTitle />;
          case 'popular':
            // popular games: art + name only
            return <PopularGrid key={b.id} id={b.id} title={b.title} products={b.products} viewAll={b.viewAll} index={index} bare />;
          case 'products':
            return <ProductSlider key={b.id} id={b.id} title={b.title} products={b.products} viewAll={b.viewAll} index={index} />;
          case 'platforms':
            return <PlatformsBoard key={b.id} id={b.id} title={b.title} products={b.products} index={index} />;
          case 'offers':
            return <OffersSection key={b.id} id={b.id} title={b.title} endsLabel={b.endsLabel} viewAll={b.viewAll} index={index} />;
          case 'arrivals':
            return <ArrivalsRail key={b.id} id={b.id} title={b.title} products={b.products} index={index} />;
          case 'showcase':
            return <CategoryShowcase key={b.id} id={b.id} title={b.title} products={b.products} viewAll={b.viewAll} index={index} />;
          case 'reviews':
            return <ReviewsSection key={b.id} id={b.id} title={b.title} score={b.score} count={b.count} items={b.items} index={index} />;
          case 'shopping':
            return <ShoppingCards key={b.id} id={b.id} title={b.title} products={b.products} viewAll={b.viewAll} index={index} />;
        }
      })}
    </>
  );
}
