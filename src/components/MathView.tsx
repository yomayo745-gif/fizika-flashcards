import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string | null;
  text?: string | null;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  text,
  displayMode = false,
  className = '',
}) => {
  const renderedContent = useMemo(() => {
    // 1. Direct LaTeX formula rendering
    if (math) {
      try {
        const cleanMath = math.replace(/^[$]+|[$]+$/g, '').trim();
        return katex.renderToString(cleanMath, {
          displayMode,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (e) {
        console.warn('KaTeX rendering error:', e);
        return math;
      }
    }

    // 2. Text with embedded $...$ math or physics units
    if (text) {
      if (!text.includes('$')) {
        return null; // Render plain text directly
      }

      // Replace $...$ segments with KaTeX rendered HTML
      const parts = text.split(/(\$[^$]+\$)/g);
      const htmlParts = parts.map((part) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const innerMath = part.slice(1, -1);
          try {
            return katex.renderToString(innerMath, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        }
        return escapeHtml(part);
      });

      return htmlParts.join('');
    }

    return null;
  }, [math, text, displayMode]);

  if (math) {
    return (
      <div
        className={`math-rendered font-mono ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedContent || '' }}
      />
    );
  }

  if (text && renderedContent) {
    return (
      <span
        className={`math-rendered-text ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  return <span className={className}>{text}</span>;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
