import { Card, Skeleton } from '@/components/ui';

/** Label above a control, then the control itself — the shape every field has. */
function FieldSkeleton({ labelWidth, height }: { labelWidth: string; height: string }) {
  return (
    <div>
      <Skeleton className={`mb-0.5 h-2 ${labelWidth}`} />
      <Skeleton className={`w-full ${height}`} />
    </div>
  );
}

/**
 * The loading state.
 *
 * Mirrors the real layout block for block and in the same order, so when the
 * rates land nothing moves. A spinner would say "something is happening"; this
 * says "here is the shape of what you are about to read", and it costs no
 * layout shift to do so.
 */
export function ConverterSkeleton({ label }: { label: string }) {
  return (
    <Card className="flex flex-col gap-1.5 md:gap-2" aria-busy="true" aria-label={label}>
      {/* 1. Which country are you visiting? */}
      <FieldSkeleton labelWidth="w-16" height="h-touch" />

      {/* 2. Amount. */}
      <FieldSkeleton labelWidth="w-8" height="h-touch-lg" />

      {/* 3. Swap. */}
      <div className="flex justify-center">
        <Skeleton className="size-touch rounded-full" />
      </div>

      {/* 4. Your home currency. */}
      <FieldSkeleton labelWidth="w-10" height="h-touch" />

      {/* 5. The result, the rate line, and the freshness note. */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <Skeleton className="h-2 w-12" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-2 w-20" />
      </div>
    </Card>
  );
}
