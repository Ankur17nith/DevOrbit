import React from 'react';

interface PageHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  category?: string;
  badge?: React.ReactNode;
  badges?: React.ReactNode[];
  icon?: React.ElementType | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeading({
  title,
  description,
  category,
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
    return <IconComponent className="size-5 text-[#8B5CF6] shrink-0" />;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 ${className}`}>
      <div className="space-y-1">
        {category && (
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5CF6] leading-none">
            {category}
          </p>
        )}

        {badges && badges.length > 0 ? (
          <div className="flex items-center gap-2 pt-0.5">
            {badges}
          </div>
        ) : badge ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F0EDFA] text-[#8B5CF6] text-[10px] font-medium pt-0.5">
            {badge}
          </div>
        ) : null}

        <div className="flex items-center gap-2.5">
          {renderIcon()}
          <h2 className="text-2xl font-semibold tracking-[-0.045em] text-[#0B0D12]">
            {title}
          </h2>
        </div>

        {description && (
          <p className="text-xs leading-5 text-[#686D79] max-w-2xl">
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
