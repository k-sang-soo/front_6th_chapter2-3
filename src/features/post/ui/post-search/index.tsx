import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '../../../../shared/ui';

interface PostSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
}

export const PostSearch = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder = "게시물 검색...",
}: PostSearchProps) => {
  // 로컬 상태로 즉시 UI 업데이트
  const [inputValue, setInputValue] = useState(searchQuery);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // input 변경 핸들러 - 디바운스 로직 포함
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 이전 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정 (500ms 후 검색 실행)
    timeoutRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, 500);
  };

  // 초기 로드 시에만 외부 값으로 동기화
  useEffect(() => {
    setInputValue(searchQuery);
  }, []); // 빈 배열로 초기 한 번만 실행

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(e.currentTarget.value);
    }
  };

  return (
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
