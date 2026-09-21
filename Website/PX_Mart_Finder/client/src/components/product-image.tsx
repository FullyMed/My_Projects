import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <>
      {status === "loading" && <Skeleton className="absolute inset-0 rounded-none" />}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground/40">
          <ImageOff className="w-6 h-6" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
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
