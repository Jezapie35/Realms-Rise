import React from 'react';
import AssetIcon from '../AssetIcon';

export default function MarketStall({ size = 72 }: { size?: number }) {
  return <AssetIcon icon="market_stall" size={size} />;
}
