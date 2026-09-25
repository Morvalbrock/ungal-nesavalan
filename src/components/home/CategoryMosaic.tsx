import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/category";

interface Props {
  categories: Category[];
}

export function CategoryMosaic({ categories }: Props) {
  if (categories.length === 0) return null;
  const [primary, ...rest] = categories;
  const secondary = rest.slice(0, 4);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {primary && (
        <Link
          href={`/category/${primary.slug}`}
          className="group relative row-span-2 block overflow-hidden rounded-card bg-cream-warm md:col-span-1 lg:col-span-1"
        >
          <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full">
            {primary.image && (
              <Image
                src={primary.image}
                alt={primary.name}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
              <span className="eyebrow-cream">The house edit</span>
              <p className="mt-2 font-display text-3xl md:text-4xl">{primary.name}</p>
              {primary.description && (
                <p className="mt-3 max-w-sm text-[13.5px] text-cream/80">{primary.description}</p>
              )}
              <span className="mt-5 inline-flex items-center gap-2 text-[12px] uppercase tracking-widest2 text-cream">
                Explore
                <span className="h-px w-8 bg-cream transition-all group-hover:w-12" />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:col-span-2">
        {secondary.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group relative block overflow-hidden rounded-card bg-cream-warm"
          >
            <div className="relative aspect-[4/5]">
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <p className="font-display text-xl leading-tight">{c.name}</p>
                <p className="mt-1 text-[12px] text-cream/75 line-clamp-2">{c.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
