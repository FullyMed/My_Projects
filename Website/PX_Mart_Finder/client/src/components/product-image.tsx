import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

type LoadState = { src: string; status: "loading" | "loaded" | "error" };

export function ProductImage({ src, alt, className }: ProductImageProps) {
  // Status is tied to the src it was recorded for, so a src change (wouter keeps
  // ProductDetail mounted across /product/:id) reads as "loading" on the same render —
  // no reset effect that could race a cached image's onLoad and leave it invisible.
  const [state, setState] = useState<LoadState>({ src, status: "loading" });
  const status = state.src === src ? state.status : "loading";

  return (
    <>
      {status === "loading" && <Skeleton className="absolute inset-0 rounded-none" />}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground/40">
          <ImageOff className="w-6 h-6" />
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={() => setState({ src, status: "loaded" })}
          onError={() => setState({ src, status: "error" })}
          className={cn(
            "transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </>
  );
}
