import { SlideCard } from "@/components/content/slide-card";

interface SlideGridProps {
  slides: any[];
  emptyMessage?: string;
  onDeleteSlide?: (slideId: string, filePath: string) => Promise<void>;
}

export function SlideGrid({
  slides,
  emptyMessage = "No slides found",
  onDeleteSlide,
}: SlideGridProps) {
  // Check if slides is null, undefined, or empty
  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slides.map((slide) => (
        <SlideCard key={slide.id} slide={slide} onDelete={onDeleteSlide} />
      ))}
    </div>
  );
}
