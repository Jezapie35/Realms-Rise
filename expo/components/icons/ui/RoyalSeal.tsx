import React from 'react';
import AssetIcon from '../AssetIcon';

export default function RoyalSeal({ size = 64 }: { size?: number }) {
  return <AssetIcon icon="seal" size={size} />;
}
