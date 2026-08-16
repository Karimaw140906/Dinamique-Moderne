import type { ComponentType } from "react";
import {
  GridClassicLayout,
  MasonryLayout,
  BigCardsLayout,
  SmallCardsLayout,
  ListLayout,
  CarouselLayout,
  MagazineLayout,
  type CatalogueLayoutProps,
} from "./catalogue-layouts";

export const layoutRegistry: Record<string, ComponentType<CatalogueLayoutProps>> = {
  grid_classic: GridClassicLayout,
  masonry: MasonryLayout,
  big_cards: BigCardsLayout,
  small_cards: SmallCardsLayout,
  list: ListLayout,
  carousel: CarouselLayout,
  magazine: MagazineLayout,
};

export function resolveLayout(key: string): ComponentType<CatalogueLayoutProps> {
  return layoutRegistry[key] ?? layoutRegistry.grid_classic;
}
