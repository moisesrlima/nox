import React, { useEffect } from 'react';

interface AdUnitProps {
  className?: string;
  slot?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdUnit({ className = "", slot = "YOUR_AD_SLOT_ID" }: AdUnitProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col items-center justify-center p-2 ${className}`}>
      <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 opacity-50">Patrocinado</span>
      <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
        <ins className="adsbygoogle"
             style={{ display: 'inline-block', width: '100%', height: '100%', minHeight: '100px' }}
             data-ad-client="ca-pub-8363850505048882"
             data-ad-slot={slot}
             data-ad-format="fluid"
             data-ad-layout-key="-gw-3+1f-3d+2z"
             data-full-width-responsive="false"></ins>
      </div>
    </div>
  );
}
