interface TextHighlighterProps {
  text: string | undefined;
  highlight: string;
  className?: string;
}

/**
 * 텍스트에서 특정 문자열을 하이라이트하는 컴포넌트
 * 검색어 강조 표시 등에 사용
 */
export const TextHighlighter = ({ text, highlight, className }: TextHighlighterProps) => {
  if (!text) return null;
  
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
};