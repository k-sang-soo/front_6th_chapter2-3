import { Tag } from '../../../../entities/tag/model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui';

interface TagFilterProps {
  selectedTag: string;
  tags: Tag[];
  onTagChange: (tag: string) => void;
  placeholder?: string;
  className?: string;
}

export const TagFilter = ({
  selectedTag,
  tags,
  onTagChange,
  placeholder = "태그 선택",
  className = "w-[180px]",
}: TagFilterProps) => {
  return (
    <Select value={selectedTag || 'all'} onValueChange={onTagChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">모든 태그</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.url} value={tag.slug}>
            {tag.slug}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};