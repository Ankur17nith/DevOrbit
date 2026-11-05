import React from 'react';

interface PageHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  badges?: React.ReactNode[];
  icon?: React.ElementType | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeading({
  title,
  description,
  badge,
  badges,
  icon,
  actions,
  className = '',
}: PageHeadingProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="size-6 text-[#8B5CF6] shrink-0" />;
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1F2430] ${className}`}>
      <div className="space-y-1.5">
        {badges && badges.length > 0 ? (
          <div className="flex items-center gap-2 mb-1">
            {badges}
          </div>
        ) : badge ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-mono font-medium text-[#A78BFA] mb-1">
            {badge}
          </div>
        ) : null}
        <div className="flex items-center gap-2.5">
          {renderIcon()}
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F8FAFC] tracking-tight">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#686D79] max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
