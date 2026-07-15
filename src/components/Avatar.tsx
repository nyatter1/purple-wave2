import React from 'react';

interface AvatarProps {
  src: string;
  alt?: string;
  className?: string; // additional classes for the image itself (e.g. rounded-full)
  decoration?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  containerClassName?: string; // additional classes for the wrapper container
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  className = "",
  decoration,
  size = "md",
  containerClassName = ""
}) => {
  // Map size keys to standard Tailwind width/height classes
  let sizeClasses = "w-10 h-10";
  
  switch (size) {
    case 'xs':
      sizeClasses = "w-6 h-6";
      break;
    case 'sm':
      sizeClasses = "w-8 h-8";
      break;
    case 'md':
      sizeClasses = "w-10 h-10";
      break;
    case 'lg':
      sizeClasses = "w-12 h-12";
      break;
    case 'xl':
      sizeClasses = "w-16 h-16";
      break;
    case '2xl':
      sizeClasses = "w-24 h-24";
      break;
    case '3xl':
      sizeClasses = "w-32 h-32";
      break;
    case 'custom':
      sizeClasses = ""; // handled by parent via custom wrapper classes
      break;
    default:
      sizeClasses = "w-10 h-10";
  }

  // Default fallback image if src is empty
  const avatarSrc = src || "https://api.dicebear.com/7.x/adventurer/svg?seed=default";

  // Check if decoration path is relative or absolute, and normalize
  let decorationUrl = decoration;
  if (decorationUrl) {
    if (decorationUrl.startsWith('http')) {
      // It's already a full URL, do nothing
    } else {
      // It's an old path, let's map it to the new Github URL
      let filename = decorationUrl.split('/').pop() || decorationUrl;
      filename = filename.replace(/_/g, ' ');
      
      // Handle exceptions where the old filename doesn't perfectly map to the new Github filename spaces
      if (filename === "Cherry Blossom Dark Pink.gif" && !filename.includes('(')) {
        // We just let it be
      }
      
      decorationUrl = `https://raw.githubusercontent.com/nyatter1/nitro./main/${encodeURIComponent(filename)}`;
      
      // Specifically fix the parenthesis issues in the encode
      decorationUrl = decorationUrl.replace(/\(/g, '%28').replace(/\)/g, '%29');
    }
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${containerClassName}`}>
      <img
        src={avatarSrc}
        alt={alt}
        className={`w-full h-full rounded-full object-cover ${className}`}
        referrerPolicy="no-referrer"
      />
      {decorationUrl && (
        <img
          src={decorationUrl}
          alt="Avatar Decoration"
          className="absolute w-[124%] h-[124%] max-w-none pointer-events-none select-none z-10 scale-[1.12]"
          referrerPolicy="no-referrer"
          style={{
            transformOrigin: 'center center',
          }}
        />
      )}
    </div>
  );
};
