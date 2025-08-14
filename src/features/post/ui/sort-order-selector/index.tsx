import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui';

export type SortOrderType = 'asc' | 'desc';

interface SortOrderSelectorProps {
  sortOrder: SortOrderType;
  onSortOrderChange: (sortOrder: SortOrderType) => void;
  placeholder?: string;
  className?: string;
}

export const SortOrderSelector = ({
  sortOrder,
  onSortOrderChange,
  placeholder = "정렬 순서",
  className = "w-[180px]",
}: SortOrderSelectorProps) => {
  return (
    <Select 
      value={sortOrder} 
      onValueChange={(value) => onSortOrderChange(value as SortOrderType)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="asc">오름차순</SelectItem>
        <SelectItem value="desc">내림차순</SelectItem>
      </SelectContent>
    </Select>
  );
};