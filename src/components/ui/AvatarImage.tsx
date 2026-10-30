import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarImageProps {
  url?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colors = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-emerald-600',
  'from-[#e76f2f] to-orange-500',
  'from-purple-400 to-fuchsia-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getGradient(name: string) {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

export default function AvatarImage({ url, name, size = 'md', className }: AvatarImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-[120px] h-[120px] text-4xl',
  };

  const roundedClass = size === 'xl' ? 'rounded-2xl' : 'rounded-full';

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={cn('object-cover', sizeClasses[size], roundedClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center text-white font-bold bg-gradient-to-br shadow-inner',
        getGradient(name),
        sizeClasses[size],
        roundedClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
