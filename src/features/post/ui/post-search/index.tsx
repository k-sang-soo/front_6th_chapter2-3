import { Search } from 'lucide-react';
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
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
