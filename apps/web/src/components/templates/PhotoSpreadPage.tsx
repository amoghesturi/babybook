import type { PhotoSpreadContent, PhotoSpreadVariant, MediaItem } from '@babybook/shared';

interface Props {
  content: PhotoSpreadContent;
  childName: string;
  variant?: PhotoSpreadVariant;
}

// Normalize old photo-only rows to the unified MediaItem shape
function normalizeMedia(content: PhotoSpreadContent): MediaItem[] {
  if (content.media && content.media.length > 0) return content.media;
  return content.photos.map((p) => ({ ...p, media_type: 'photo' as const }));
}

function PhotoCorners() {
  return (
    <>
      <div
        className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.2)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div
        className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.2)', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.2)', clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.2)', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      />
    </>
  );
}

function MediaTile({
  item,
  alt,
  className,
  style,
}: {
  item: MediaItem;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (item.media_type === 'video') {
    return (
      <video
        src={item.public_url ?? item.storage_path}
        controls
        playsInline
        muted
        className={className}
        style={{ ...style, background: '#000' }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={item.public_url ?? item.storage_path}
      alt={alt}
      className={className}
      style={style}
    />
  );
}

export function PhotoSpreadPage({ content, childName }: Props) {
  const media = normalizeMedia(content);

  /* ── Single photo/video ── */
  if (content.layout === 'single') {
    const item = media[0];
    return (
      <div
        className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative"
        style={{ background: '#111' }}
      >
        {item && (
          <>
            <MediaTile
              item={item}
              alt={item.caption || childName}
              className="w-full h-full object-cover"
              style={{ minHeight: '500px', display: 'block' }}
            />
            {/* Vignette (skip for video) */}
            {item.media_type === 'photo' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.42) 100%)',
                }}
              />
            )}
            {item.caption && (
              <div
                className="absolute bottom-0 inset-x-0 px-8 py-6"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.15) 75%, transparent 100%)',
                }}
              >
                <p className="text-white font-handwritten text-xl text-center drop-shadow">
                  {item.caption}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  /* ── Grid layout ── */
  if (content.layout === 'grid') {
    const items = media.slice(0, 4);
    const isTwoCol = items.length >= 2;

    return (
      <div
        className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden"
        style={{
          background: '#1a1a1a',
          display: 'grid',
          gridTemplateColumns: isTwoCol ? '1fr 1fr' : '1fr',
          gridTemplateRows: items.length <= 2 ? '1fr' : '1fr 1fr',
          gap: '3px',
          padding: '3px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              gridColumn: items.length === 3 && i === 0 ? '1 / 3' : undefined,
              minHeight: '180px',
            }}
          >
            <MediaTile
              item={item}
              alt={item.caption || `Item ${i + 1}`}
              className="w-full h-full object-cover"
              style={{ display: 'block', minHeight: '180px' }}
            />
            {/* Film-strip perforations on top edge of first item */}
            {i === 0 && (
              <div
                className="absolute top-0 left-0 right-0 flex items-center px-2 gap-2 pointer-events-none"
                style={{ height: '18px', background: 'rgba(0,0,0,0.38)' }}
              >
                {Array.from({ length: 12 }).map((_, j) => (
                  <div
                    key={j}
                    className="rounded-sm flex-shrink-0"
                    style={{ width: '12px', height: '9px', background: 'rgba(255,255,255,0.22)' }}
                  />
                ))}
              </div>
            )}
            {item.caption && (
              <div
                className="absolute bottom-0 inset-x-0 px-3 py-2"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.58), transparent)' }}
              >
                <p className="text-white text-xs font-handwritten">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Polaroid layout ── */
  const rotations = [-2.5, 1.5, -1, 2, -1.5, 1];
  const isSingle = media.length === 1;

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex items-center justify-center flex-wrap gap-6 p-8"
      style={{ background: 'var(--color-background)' }}
    >
      {media.map((item, i) => {
        const rot = rotations[i % rotations.length];
        // Avoid CSS transforms on video elements (rendering bugs in some browsers)
        const isVideo = item.media_type === 'video';

        return (
          <div
            key={i}
            className="relative transition-transform duration-300 hover:scale-105 hover:z-10"
            style={{
              background: 'white',
              padding: isSingle ? '10px 10px 42px' : '7px 7px 34px',
              width: isSingle ? '260px' : '168px',
              boxShadow: '0 10px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
              transform: isVideo ? undefined : `rotate(${rot}deg)`,
              cursor: 'default',
            }}
          >
            {/* Media with corner marks */}
            <div className="relative overflow-hidden">
              <MediaTile
                item={item}
                alt={item.caption || `Item ${i + 1}`}
                className="block w-full object-cover"
                style={{ height: isSingle ? '238px' : '148px' }}
              />
              {!isVideo && <PhotoCorners />}
            </div>

            {/* Caption / placeholder */}
            <div
              className="flex items-center justify-center"
              style={{ height: isSingle ? '42px' : '34px', paddingTop: '8px' }}
            >
              {item.caption ? (
                <p
                  className="font-handwritten text-center leading-tight"
                  style={{ fontSize: isSingle ? '15px' : '12px', color: '#4a3520' }}
                >
                  {item.caption}
                </p>
              ) : (
                <p
                  className="font-handwritten text-center"
                  style={{ fontSize: '11px', color: '#bbb' }}
                >
                  {childName} ♡
                </p>
              )}
            </div>

            {/* Inner shadow for depth */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}
            />
          </div>
        );
      })}
    </div>
  );
}
