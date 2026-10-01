'use client';

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  user?: {
    photoURL?: string | null;
    email?: string | null;
    displayName?: string | null;
  } | null;
  customPhotoUrl?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showBorder?: boolean;
}

export function getUserAvatarUrl(
  user?: { photoURL?: string | null; email?: string | null; displayName?: string | null } | null,
  customPhotoUrl?: string | null
): string {
  if (customPhotoUrl && customPhotoUrl.trim() !== "") {
    return customPhotoUrl.trim();
  }
  if (user?.photoURL && user.photoURL.trim() !== "") {
    return user.photoURL.trim();
  }
  
  const identifier = user?.displayName?.trim() || user?.email?.split("@")[0]?.trim() || "User";
  // UI Avatars with ASDRI Theme (Emerald green background #064e3b, Amber text #fbbf24)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=064e3b&color=fbbf24&bold=true&size=256`;
}

export function UserAvatar({
  user,
  customPhotoUrl,
  className = "",
  size = "md",
  showBorder = true,
}: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => getUserAvatarUrl(user, customPhotoUrl));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(getUserAvatarUrl(user, customPhotoUrl));
  }, [user?.photoURL, user?.email, user?.displayName, customPhotoUrl]);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      const identifier = user?.displayName?.trim() || user?.email?.split("@")[0]?.trim() || "User";
      setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=064e3b&color=fbbf24&bold=true&size=256`);
    }
  };

  const borderClass = showBorder ? "border-2 border-amber-400 shadow-xs" : "";
  const hasValidSrc = Boolean(imgSrc && imgSrc.trim() !== "");

  return (
    <div className={`relative inline-block rounded-full overflow-hidden shrink-0 ${sizeClasses[size]} ${borderClass} ${className}`}>
      {hasValidSrc ? (
        <img
          src={imgSrc}
          alt={user?.displayName || user?.email || "User Avatar"}
          onError={handleImageError}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full bg-[#064e3b] text-amber-400 font-extrabold flex items-center justify-center rounded-full">
          {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-1/2 h-1/2" />}
        </div>
      )}
    </div>
  );
}
