import React from 'react';

export function Section({
  id,
  number,
  category,
  title,
  subtitle,
  rightContent,
  children,
  className = '',
  borderBottom = true,
}) {
  return (
    <section
      id={id}
      className={`w-full py-16 md:py-24 bg-bg ${borderBottom ? 'border-b border-line' : ''} ${className}`}
    >
      <div className="max-w-[76rem] mx-auto px-4 md:px-8">
        {(number || category || title || rightContent) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
            <div>
              {(number || category) && (
                <span className="font-mono text-[0.6875rem] tracking-widest text-muted uppercase block mb-2">
                  {number && category ? `${number} / ${category}` : number || category}
                </span>
              )}
              {title && (
                <h2 className="text-2xl sm:text-3xl text-text font-display uppercase tracking-wide">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="font-sans text-sm md:text-base text-muted mt-2 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {rightContent && (
              <div className="font-mono text-[0.625rem] md:text-[0.6875rem] text-faint tracking-wider uppercase">
                {rightContent}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}

export default Section;
