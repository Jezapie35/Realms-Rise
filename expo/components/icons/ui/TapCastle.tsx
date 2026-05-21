import React from 'react';
import Svg, { Path, Rect, Line, Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

const K = '#1c1410';
const S = '#d0ccc0';
const SL = '#e8e4da';
const SD = '#9a9690';
const SLATE = '#4e4e5c';
const SLATEL = '#7a7a8a';
const GOLD = '#c8920a';
const GOLDL = '#f0c030';
const WIN = '#1a3060';
const FLAG_R = '#cc3010';
const FLAG_G = '#f0c030';
const SKY = '#0a1a3a';

export default function TapCastle({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="tcSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%"   stopColor="#06112a" />
          <Stop offset="100%" stopColor="#0e2450" />
        </LinearGradient>
        <RadialGradient id="tcMoon" cx="78%" cy="18%" r="12%">
          <Stop offset="0%"   stopColor="#fff8e0" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#fff8e0" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Night sky */}
      <Rect x="0" y="0" width="120" height="90" fill="url(#tcSky)" />
      {/* Moon glow */}
      <Rect x="0" y="0" width="120" height="90" fill="url(#tcMoon)" />
      <Circle cx="96" cy="16" r="8" fill="#fff8e0" fillOpacity="0.9" />

      {/* Stars */}
      {[[6,8],[18,14],[42,6],[100,10],[112,20],[4,30],[114,38]].map(([x,y],i)=>(
        <Circle key={i} cx={x} cy={y} r="0.9" fill="#ffffff" fillOpacity="0.6" />
      ))}

      {/* Ground */}
      <Rect x="0" y="90" width="120" height="30" fill="#5a4828" />
      <Rect x="0" y="90" width="120" height="5"  fill="#8a7248" />

      {/* ── Left tower ── */}
      {/* Battlements */}
      <Rect x="2"  y="40" width="8" height="10" fill={S}  stroke={K} strokeWidth="1" />
      <Rect x="14" y="40" width="8" height="10" fill={S}  stroke={K} strokeWidth="1" />
      {/* Parapet */}
      <Rect x="2" y="50" width="26" height="4" fill={SL} stroke={K} strokeWidth="0.8" />
      {/* Body */}
      <Rect x="2" y="54" width="26" height="36" fill={S} stroke={K} strokeWidth="1.2" />
      <Rect x="2" y="54" width="4"  height="36" fill={SD} />
      {/* Stone courses */}
      <Line x1="2" y1="64" x2="28" y2="64" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      <Line x1="2" y1="74" x2="28" y2="74" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      <Line x1="2" y1="84" x2="28" y2="84" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      {/* Arrow slits */}
      <Rect x="7"  y="57" width="4" height="10" rx="2" fill={K} />
      <Rect x="17" y="57" width="4" height="10" rx="2" fill={K} />
      {/* Flag L */}
      <Line x1="8" y1="40" x2="8" y2="28" stroke={GOLD} strokeWidth="1.3" />
      <Path d="M8,28 L22,32 L8,36 Z" fill={FLAG_R} stroke={K} strokeWidth="0.7" />

      {/* ── Right tower ── */}
      <Rect x="90"  y="40" width="8" height="10" fill={S}  stroke={K} strokeWidth="1" />
      <Rect x="102" y="40" width="8" height="10" fill={S}  stroke={K} strokeWidth="1" />
      <Rect x="92" y="50" width="26" height="4" fill={SL} stroke={K} strokeWidth="0.8" />
      <Rect x="92" y="54" width="26" height="36" fill={S} stroke={K} strokeWidth="1.2" />
      <Rect x="92" y="54" width="4"  height="36" fill={SD} />
      <Line x1="92" y1="64" x2="118" y2="64" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      <Line x1="92" y1="74" x2="118" y2="74" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      <Line x1="92" y1="84" x2="118" y2="84" stroke={K} strokeWidth="0.4" strokeOpacity="0.28" />
      <Rect x="97"  y="57" width="4" height="10" rx="2" fill={K} />
      <Rect x="107" y="57" width="4" height="10" rx="2" fill={K} />
      <Line x1="110" y1="40" x2="110" y2="28" stroke={GOLD} strokeWidth="1.3" />
      <Path d="M110,28 L96,32 L110,36 Z" fill={FLAG_R} stroke={K} strokeWidth="0.7" />

      {/* ── Centre keep (taller) ── */}
      {/* Battlements */}
      <Rect x="32" y="28" width="10" height="12" fill={S}  stroke={K} strokeWidth="1.1" />
      <Rect x="48" y="28" width="10" height="12" fill={S}  stroke={K} strokeWidth="1.1" />
      <Rect x="64" y="28" width="10" height="12" fill={S}  stroke={K} strokeWidth="1.1" />
      {/* Parapet */}
      <Rect x="30" y="40" width="60" height="5" fill={SL} stroke={K} strokeWidth="1" />
      {/* Keep body */}
      <Rect x="30" y="45" width="60" height="45" fill={SL} stroke={K} strokeWidth="1.4" />
      <Rect x="30" y="45" width="6"  height="45" fill={SD} />
      <Line x1="30" y1="58" x2="90" y2="58" stroke={K} strokeWidth="0.5" strokeOpacity="0.28" />
      <Line x1="30" y1="70" x2="90" y2="70" stroke={K} strokeWidth="0.5" strokeOpacity="0.28" />
      <Line x1="30" y1="80" x2="90" y2="80" stroke={K} strokeWidth="0.5" strokeOpacity="0.28" />

      {/* Keep windows (tall arched, 2 each side) */}
      <Path d="M36,45 L36,62 Q36,68 42,68 Q48,68 48,62 L48,45 Z" fill={WIN} stroke={K} strokeWidth="1" />
      <Line x1="42" y1="45" x2="42" y2="68" stroke={K} strokeWidth="0.7" />
      <Path d="M72,45 L72,62 Q72,68 78,68 Q84,68 84,62 L84,45 Z" fill={WIN} stroke={K} strokeWidth="1" />
      <Line x1="78" y1="45" x2="78" y2="68" stroke={K} strokeWidth="0.7" />

      {/* Curtain walls */}
      <Rect x="28"  y="58" width="4"  height="32" fill={SD} stroke={K} strokeWidth="0.8" />
      <Rect x="88"  y="58" width="4"  height="32" fill={SD} stroke={K} strokeWidth="0.8" />

      {/* Main gate arch */}
      <Path d="M46,90 L46,72 Q46,64 60,64 Q74,64 74,72 L74,90 Z"
        fill={K} stroke={K} strokeWidth="1.1" />
      <Path d="M48,90 L48,73 Q48,66 60,66 Q72,66 72,73 L72,90 Z" fill="#160e08" />
      {/* Portcullis */}
      <Line x1="52" y1="66" x2="52" y2="90" stroke={SD} strokeWidth="1" />
      <Line x1="58" y1="65" x2="58" y2="90" stroke={SD} strokeWidth="1" />
      <Line x1="64" y1="65" x2="64" y2="90" stroke={SD} strokeWidth="1" />
      <Line x1="70" y1="66" x2="70" y2="90" stroke={SD} strokeWidth="1" />
      <Line x1="48" y1="72" x2="72" y2="72" stroke={SD} strokeWidth="0.8" />
      <Line x1="48" y1="78" x2="72" y2="78" stroke={SD} strokeWidth="0.8" />
      <Line x1="48" y1="84" x2="72" y2="84" stroke={SD} strokeWidth="0.8" />
      {/* Keystone */}
      <Path d="M57,64 L60,60 L63,64 Z" fill={GOLDL} />

      {/* Centre flag */}
      <Line x1="60" y1="28" x2="60" y2="14" stroke={GOLD} strokeWidth="1.5" />
      <Path d="M60,14 L78,20 L60,26 Z" fill={FLAG_G} stroke={K} strokeWidth="0.8" />

      {/* Gold trim along base */}
      <Rect x="0" y="88" width="120" height="2" fill={GOLD} />
    </Svg>
  );
}
