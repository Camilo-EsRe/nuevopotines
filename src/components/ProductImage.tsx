interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export function ProductImage({ src, alt, className, imgClassName }: ProductImageProps) {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className ?? ''}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover rounded-[inherit] ${imgClassName ?? ''}`}
      />
    </div>
  );
}
