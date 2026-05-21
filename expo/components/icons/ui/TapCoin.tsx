import React from 'react';
import AssetIcon from '../AssetIcon';

export default function TapCoin({ size = 240 }: { size?: number }) {
  return <AssetIcon icon="coin" size={size} />;
}
