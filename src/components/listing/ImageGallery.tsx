import { useState, type KeyboardEvent } from "react";
import { Car, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ListingImage } from "@/services/listings";

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
}

const arrowClass =
  "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow transition hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring";

export const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-2xl border bg-muted text-muted-foreground">
        <Car className="h-12 w-12" />
        <p className="text-sm">The seller has not added photos</p>
      </div>
    );
  }

  const count = images.length;
  const go = (step: number) => setIndex((current) => (current + step + count) % count);
  const current = images[index];

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  };

  const navigation = count > 1 && (
    <>
      <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={`${arrowClass} left-3`}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Next photo" onClick={() => go(1)} className={`${arrowClass} right-3`}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  );

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-muted"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
      >
        <button type="button" className="block w-full" onClick={() => setFullscreen(true)} aria-label="View photo full screen">
          <img src={current.url} alt={`${title}, photo ${index + 1} of ${count}`} className="aspect-[16/10] w-full object-cover" />
        </button>
        {navigation}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="View photo full screen"
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, thumbIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(thumbIndex)}
              aria-label={`Show photo ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-offset-2 ring-offset-background transition ${
                thumbIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-6xl border-0 bg-black p-0 sm:rounded-2xl" onKeyDown={onKeyDown}>
          <DialogTitle className="sr-only">{title}, photo {index + 1} of {count}</DialogTitle>
          <div className="relative">
            <img src={current.url} alt={`${title}, photo ${index + 1} of ${count}`} className="max-h-[85vh] w-full object-contain" />
            {navigation}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
