import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  text: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className = '' }) => {
  // Split text by $ delimiters.
  // Example: "Force is $F = ma$" -> ["Force is ", "F = ma", ""]
  // Even indices are text, odd indices are math.
  const parts = text.split('$');

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Even index: Regular text
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        }
        
        // Odd index: Math content
        // Verify it's not empty or just whitespace
        if (!part.trim()) return <span key={index}>$</span>;

        try {
          const html = katex.renderToString(part, {
            throwOnError: false,
            displayMode: false, // inline math
          });
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="inline-block mx-0.5" // Add subtle spacing around math
            />
          );
        } catch (error) {
          // Fallback to raw text if parsing fails
          console.error("KaTeX error:", error);
          return <span key={index} className="text-red-600 font-mono text-sm">${part}$</span>;
        }
      })}
    </span>
  );
};
