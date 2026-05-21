import React from 'react';
import AssetIcon from '../AssetIcon';

export default function Barracks({ size = 72 }: { size?: number }) {
  return <AssetIcon icon="barracks" size={size} />;
}
