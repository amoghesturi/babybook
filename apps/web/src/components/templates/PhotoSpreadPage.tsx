import type { PhotoSpreadContent } from '@babybook/shared';

interface Props {
  content: PhotoSpreadContent;
  childName: string;
}

export function PhotoSpreadPage({ content, childName }: Props) {
  if (content.layout === 'single') {
    return (
      <div className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative">
        {content.photos[0] && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.photos[0].public_url ?? content.photos[0].storage_path}
              alt={content.photos[0].caption || childName}
              className="w-full h-full object-cover"
              style={{ minHeight: '500px' }}
            />
            {content.photos[0].caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                <p className="text-white font-handwritten text-lg">{content.photos[0].caption}</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (content.layout === 'grid') {
    const photos = content.photos.slice(0, 4);
    const gridCols = photos.length === 1 ? 'grid-cols-1' : photos.length <= 2 ? 'grid-cols-2' : 'grid-cols-2';

    return (
      <div className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden bg-black p-1">
        <div className={`grid ${gridCols} gap-1 h-full`}>
          {photos.map((photo, i) => (
            <div key={i} className="relative overflow-hidden" style={{ minHeight: photos.length <= 2 ? '240px' : '200px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.public_url ?? photo.storage_path}
                alt={photo.caption || `Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 px-3 py-2">
                  <p className="text-white text-xs font-handwritten">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Polaroid layout
  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex items-center justify-center flex-wrap gap-4 p-8"
      style={{ background: 'var(--color-background)' }}
    >
      {content.photos.map((photo, i) => {
        const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
        const rot = rotations[i % rotations.length];

        return (
          <div
            key={i}
            className={`bg-white p-2 pb-8 shadow-lg ${rot} hover:rotate-0 transition-transform duration-200`}
            style={{ width: content.photos.length === 1 ? '280px' : '180px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.public_url ?? photo.storage_path}
              alt={photo.caption || `Photo ${i + 1}`}
              className="w-full object-cover"
              style={{ height: content.photos.length === 1 ? '260px' : '160px' }}
            />
            {photo.caption && (
              <p className="font-handwritten text-center text-sm mt-2 text-text-secondary px-1">
                {photo.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
