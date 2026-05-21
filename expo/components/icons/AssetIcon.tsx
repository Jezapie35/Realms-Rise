import React, { memo, useMemo } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { ICON_SOURCES, IconKey } from './assetSources';

interface Props {
  icon: IconKey;
  size?: number;
}

/**
 * Shared icon renderer.
 *
 * - Uses expo-image for memory+disk caching (faster than RN Image after first load)
 * - `transition={0}` skips the default fade-in so cached assets show instantly
 * - `cachePolicy="memory-disk"` keeps the decoded bitmap hot between mounts
 * - Memoized so identical (icon, size) pairs never re-render
 */
function AssetIconBase({ icon, size = 72 }: Props) {
  const source = ICON_SOURCES[icon];
  const style = useMemo(() => ({ width: size, height: size }), [size]);
  return (
    <ExpoImage
      source={source}
      style={style}
      contentFit="contain"
      transition={0}
      cachePolicy="memory-disk"
      priority="high"
    />
  );
}

export const AssetIcon = memo(AssetIconBase);
export default AssetIcon;
