import { useCallback, useRef, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaCarouselType } from "embla-carousel";

type CarouselSnap = {
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  snapCount: number;
};

const EMPTY_SNAP: CarouselSnap = {
  selectedIndex: 0,
  canScrollPrev: false,
  canScrollNext: false,
  snapCount: 0
};

function readSnap(api: EmblaCarouselType | undefined): CarouselSnap {
  if (!api) return EMPTY_SNAP;
  return {
    selectedIndex: api.selectedScrollSnap(),
    canScrollPrev: api.canScrollPrev(),
    canScrollNext: api.canScrollNext(),
    snapCount: api.scrollSnapList().length
  };
}

export const useActivityCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
      direction: "rtl",
      slidesToScroll: 1
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const snapRef = useRef<CarouselSnap>(EMPTY_SNAP);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onStoreChange);
      emblaApi.on("reInit", onStoreChange);
      return () => {
        emblaApi.off("select", onStoreChange);
        emblaApi.off("reInit", onStoreChange);
      };
    },
    [emblaApi]
  );

  const getSnapshot = useCallback(() => {
    const next = readSnap(emblaApi);
    const prev = snapRef.current;
    if (
      prev.selectedIndex === next.selectedIndex &&
      prev.canScrollPrev === next.canScrollPrev &&
      prev.canScrollNext === next.canScrollNext &&
      prev.snapCount === next.snapCount
    ) {
      return prev;
    }
    snapRef.current = next;
    return next;
  }, [emblaApi]);

  const snap = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAP);
  const scrollSnaps = Array.from({ length: snap.snapCount }, (_, i) => i);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return {
    emblaRef,
    selectedIndex: snap.selectedIndex,
    scrollSnaps,
    canScrollPrev: snap.canScrollPrev,
    canScrollNext: snap.canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo
  };
};
