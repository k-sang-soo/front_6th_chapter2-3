import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui';

export type SortByType = 'none' | 'id' | 'title' | 'reactions';

interface SortSelectorProps {
  sortBy: SortByType;
  onSortChange: (sortBy: SortByType) => void;
  placeholder?: string;
  className?: string;
}

export const SortSelector = ({
  sortBy,
  onSortChange,
  placeholder = "정렬 기준",
  className = "w-[180px]",
}: SortSelectorProps) => {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">없음</SelectItem>
        <SelectItem value="id">ID</SelectItem>
        <SelectItem value="title">제목</SelectItem>
        <SelectItem value="reactions">반응</SelectItem>
      </SelectContent>
    </Select>
  );
};