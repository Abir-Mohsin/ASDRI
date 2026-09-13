'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteBranding } from '@/hooks/useSiteBranding';
import { Shield } from 'lucide-react';
import clsx from 'clsx';
import { Locale } from '@/lib/dictionary';

export interface BrandLogoProps {
  variant?: 'navbar' | 'sidebar' | 'footer' | 'auth' | 'icon-only' | 'card';
  locale?: Locale | string;
  className?: string;
  showText?: boolean;
  linkToHome?: boolean;
  sizeOverride?: number;
}

export function BrandLogo({
  variant = 'navbar',
  locale = 'en',
  className = '',
  showText = true,
  linkToHome = true,
  sizeOverride,
}: BrandLogoProps) {
  const { branding } = useSiteBranding();
  const [imageError, setImageError] = useState(false);

  // Derive localized names
  const shortName = (
    locale === 'bn' && branding.shortNameBn ? branding.shortNameBn :
    locale === 'ar' && branding.shortNameAr ? branding.shortNameAr :
    branding.shortName || 'ASDRI'
  );

  const subtitle = (
    locale === 'bn' && branding.subtitleBn ? branding.subtitleBn :
    locale === 'ar' && branding.subtitleAr ? branding.subtitleAr :
    branding.subtitle || 'Dawah & Research'
  );

  const fullName = (
    locale === 'bn' && branding.fullNameBn ? branding.fullNameBn :
    locale === 'ar' && branding.fullNameAr ? branding.fullNameAr :
    branding.fullName || 'As-Sunnah Dawah & Research Institute'
  );

  // Shape class helper
  const getShapeClass = () => {
    switch (branding.logoShape) {
      case 'circle':
        return 'rounded-full overflow-hidden';
      case 'square':
        return 'rounded-none overflow-hidden';
      case 'original':
        return 'rounded-md';
      case 'rounded':
      default:
        return 'rounded-xl overflow-hidden';
    }
  };

  // Dimensions based on variant and configuration
  const baseHeight = sizeOverride || branding.logoHeight || (
    variant === 'sidebar' ? 44 :
    variant === 'auth' ? 56 :
    variant === 'footer' ? 40 : 40
  );

  const hasValidImage = Boolean(branding.logoUrl && !imageError && branding.sourceType !== 'default');

  // Background container styling for image or initial
  const getBackgroundClass = () => {
    if (!hasValidImage) {
      if (variant === 'sidebar') return 'bg-[#78350f] text-amber-200';
      return 'bg-amber-500 text-emerald-950';
    }
    switch (branding.logoBackground) {
      case 'white':
        return 'bg-white shadow-2xs p-0.5';
      case 'dark':
        return 'bg-emerald-950/80 p-0.5';
      case 'amber':
        return 'bg-amber-500/20 p-0.5 border border-amber-500/30';
      case 'transparent':
      default:
        return 'bg-transparent';
    }
  };

  // Render the visual logo element (Image or Monogram)
  const renderVisual = () => {
    if (hasValidImage) {
      return (
        <div
          style={{ width: `${baseHeight}px`, height: `${baseHeight}px` }}
          className={clsx(
            'flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
            getShapeClass(),
            getBackgroundClass()
          )}
        >
          {/* Using img tag with referrerPolicy to guarantee drive & cdn compatibility */}
          <img
            src={branding.logoUrl}
            alt={fullName}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // Default Fallback Monogram or Shield
    if (variant === 'sidebar') {
      return (
        <div 
          style={{ width: `${baseHeight}px`, height: `${baseHeight}px` }}
          className={clsx(
            'bg-[#78350f] text-amber-200 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform',
            getShapeClass()
          )}
        >
          <Shield className="w-6 h-6 fill-amber-200/20 stroke-amber-200" />
        </div>
      );
    }

    // Standard Amber Monogram
    return (
      <div
        style={{ width: `${baseHeight}px`, height: `${baseHeight}px` }}
        className={clsx(
          'bg-amber-500 text-emerald-950 flex items-center justify-center font-extrabold shadow-2xs shrink-0 group-hover:scale-105 transition-transform',
          baseHeight >= 50 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl font-serif',
          getShapeClass()
        )}
      >
        {branding.monogramText || 'A'}
      </div>
    );
  };

  // If icon-only is requested
  if (variant === 'icon-only') {
    if (linkToHome) {
      return (
        <Link href={`/${locale}`} className={clsx('inline-block group', className)}>
          {renderVisual()}
        </Link>
      );
    }
    return <div className={className}>{renderVisual()}</div>;
  }

  // Variant: Auth (Centered on Login / Register)
  if (variant === 'auth') {
    const content = (
      <div className={clsx('flex flex-col items-center justify-center gap-3 group', className)}>
        {renderVisual()}
        {showText && (
          <div className="text-center">
            <span className="font-extrabold text-xl sm:text-2xl leading-tight block text-slate-900 font-serif">
              {shortName}
            </span>
            <span className="text-emerald-700 text-[11px] uppercase tracking-widest block font-bold mt-0.5">
              {subtitle}
            </span>
          </div>
        )}
      </div>
    );

    return linkToHome ? <Link href={`/${locale}`} className="inline-block">{content}</Link> : content;
  }

  // Variant: Sidebar
  if (variant === 'sidebar') {
    const content = (
      <div className={clsx('flex items-center gap-3.5 group min-w-0', className)}>
        {renderVisual()}
        {showText && (
          <div className="min-w-0">
            <h1 className="text-white font-extrabold text-base tracking-tight font-serif truncate">
              {branding.fullName ? fullName : 'As-Sunnah Institute'}
            </h1>
            <p className="text-emerald-200/80 text-[11px] font-medium tracking-wide truncate">
              {subtitle || 'Dawah & Research Hub'}
            </p>
          </div>
        )}
      </div>
    );

    return linkToHome ? <Link href={`/${locale}`} className="block">{content}</Link> : content;
  }

  // Variant: Footer
  if (variant === 'footer') {
    const content = (
      <div className={clsx('flex items-center gap-3 group', className)}>
        {renderVisual()}
        {showText && (
          <div className="block">
            <span className="font-bold text-sm leading-tight block text-white font-serif">
              {shortName}
            </span>
            <span className="text-emerald-300 text-[10px] uppercase tracking-widest block font-medium">
              {subtitle}
            </span>
          </div>
        )}
      </div>
    );

    return linkToHome ? <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">{content}</Link> : content;
  }

  // Default / Variant: Navbar
  const content = (
    <div className={clsx('flex items-center gap-3 group', className)}>
      {renderVisual()}
      {showText && (
        <div className="hidden sm:block">
          <span className="font-bold text-sm leading-tight block text-white font-serif">
            {shortName}
          </span>
          <span className="text-emerald-300 text-[10px] uppercase tracking-widest block font-medium">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );

  return linkToHome ? <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">{content}</Link> : content;
}
