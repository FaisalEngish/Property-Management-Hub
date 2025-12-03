import React, { useEffect, useState } from "react";

type HostawayListing = {
  id: string;
  externalId?: string;
  title?: string;
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  thumbnailUrl?: string | null;
  imageUrls?: string[] | null;
  photosCount?: number | null;

  // Optional extra fields – will be used if present
  pricePerNight?: number | string;
  nightlyRate?: number | string;
  currency?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  maxGuests?: number | string;
  guests?: number | string;
  rating?: number | string;
};

type ImageIndexState = Record<string, number>;

const HostawayIntegration: React.FC = () => {
  const [listings, setListings] = useState<HostawayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<ImageIndexState>({});

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch("/api/hostaway/listings");
        if (!res.ok) {
          throw new Error("Failed to load Hostaway listings");
        }
        const json = await res.json();

        const data: HostawayListing[] = json.listings ?? json.data ?? [];
        setListings(data);

        // initialise image index for each listing
        const initial: ImageIndexState = {};
        for (const listing of data) {
          initial[listing.id] = 0;
        }
        setImageIndex(initial);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handlePrev = (listing: HostawayListing) => {
    const imgs = getImages(listing);
    if (imgs.length === 0) return;
    setImageIndex((prev) => {
      const current = prev[listing.id] ?? 0;
      const next = (current - 1 + imgs.length) % imgs.length;
      return { ...prev, [listing.id]: next };
    });
  };

  const handleNext = (listing: HostawayListing) => {
    const imgs = getImages(listing);
    if (imgs.length === 0) return;
    setImageIndex((prev) => {
      const current = prev[listing.id] ?? 0;
      const next = (current + 1) % imgs.length;
      return { ...prev, [listing.id]: next };
    });
  };

  const getImages = (listing: HostawayListing): string[] => {
    const fromArray = listing.imageUrls ?? [];
    const thumb = listing.thumbnailUrl ? [listing.thumbnailUrl] : [];
    // ensure unique + defined
    const merged = [...thumb, ...fromArray].filter(Boolean) as string[];
    // remove duplicates
    return Array.from(new Set(merged));
  };

  const formatPrice = (l: HostawayListing): string | null => {
    const raw =
      l.pricePerNight ??
      l.nightlyRate ??
      (l as any).price ??
      (l as any).nightly_price ??
      null;

    if (raw == null || raw === "") return null;

    const num = typeof raw === "string" ? Number(raw) : raw;
    const safeCurrency = l.currency || "$";
    if (!isNaN(num)) {
      return `${safeCurrency}${num}/night`;
    }
    return `${raw}/night`;
  };

  const getBedrooms = (l: HostawayListing) =>
    l.bedrooms ?? (l as any).bedroomsCount ?? null;
  const getBathrooms = (l: HostawayListing) =>
    l.bathrooms ?? (l as any).bathroomsCount ?? null;
  const getGuests = (l: HostawayListing) =>
    l.maxGuests ?? l.guests ?? (l as any).sleeps ?? null;
  const getRating = (l: HostawayListing) =>
    l.rating ?? (l as any).reviewScore ?? null;

  const totalCount = listings.length;

  if (loading) {
    return (
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hostaway Properties</h2>
          <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load Hostaway properties: {error}
      </div>
    );
  }

  if (!totalCount) {
    return (
      <div className="mt-6 rounded-lg border bg-white p-6 text-sm text-gray-600">
        No Hostaway properties found. Try clicking <b>Sync Properties</b> first.
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Section header like in your screenshot */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Hostaway Properties</h2>
        <span className="text-sm text-gray-500">{totalCount} Properties</span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => {
          const images = getImages(listing);
          const currentIdx = imageIndex[listing.id] ?? 0;

          // slides array (fallback to placeholder if no images)
          const slides =
            images.length > 0 ? images : ["/images/property-placeholder.jpg"];
          const totalPhotos =
            listing.photosCount ?? (images.length > 0 ? images.length : null);

          const displayTitle =
            listing.title || listing.name || "Untitled property";

          const locationParts = [listing.city, listing.country].filter(Boolean);
          const locationText = locationParts.join(", ");

          const priceText = formatPrice(listing);
          const bedrooms = getBedrooms(listing);
          const bathrooms = getBathrooms(listing);
          const guests = getGuests(listing);
          const rating = getRating(listing);

          return (
            <div
              key={listing.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {/* Image / carousel with smooth slide */}
              <div className="relative h-56 w-full overflow-hidden">
                {/* Slider track */}
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIdx * 100}%)` }}
                >
                  {slides.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`${displayTitle} photo ${idx + 1}`}
                      className="h-full w-full flex-shrink-0 object-cover"
                    />
                  ))}
                </div>

                {/* Left / right arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePrev(listing)}
                      className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow hover:bg-white"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNext(listing)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Photos badge on top-right */}
                {totalPhotos && totalPhotos > 1 && (
                  <div className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
                    +{totalPhotos - 1} photos
                  </div>
                )}

                {/* Index badge bottom-center */}
                {images.length > 0 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                    {Math.min(currentIdx + 1, images.length)} / {images.length}
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold">
                  {displayTitle}
                </h3>

                {locationText && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span role="img" aria-label="location">
                      📍
                    </span>
                    <span>{locationText}</span>
                  </div>
                )}

                {listing.description && (
                  <p className="line-clamp-2 text-xs text-gray-600">
                    {listing.description}
                  </p>
                )}

                {/* Bottom badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {priceText && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      {priceText}
                    </span>
                  )}

                  {bedrooms != null && bedrooms !== "" && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {bedrooms} bed
                    </span>
                  )}

                  {bathrooms != null && bathrooms !== "" && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {bathrooms} bath
                    </span>
                  )}

                  {guests != null && guests !== "" && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {guests} guests
                    </span>
                  )}

                  {rating != null && rating !== "" && (
                    <span className="ml-auto rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-700">
                      ⭐ {rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { HostawayIntegration };
export default HostawayIntegration;
