import { Edit2, ThumbsUp, Trash2 } from 'lucide-react';
import { Button, TextHighlighter } from '../../../../shared/ui';
import { Comment } from '../../model';

interface CommentItemProps {
  comment: Comment;
  searchQuery?: string;
  onLike: (commentId: number) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
}

/**
 * CommentItem - Entity UI Component
 * 
 * 개별 댓글을 표시하는 순수한 프레젠테이션 컴포넌트
 * Comment DTO를 받아서 UI로 렌더링하는 역할만 담당
 */
export const CommentItem = ({
  comment,
  searchQuery = '',
  onLike,
  onEdit,
  onDelete,
}: CommentItemProps) => {
  return (
    <div className="flex items-center justify-between text-sm border-b pb-1">
      <div className="flex items-center space-x-2 overflow-hidden">
        <span className="font-medium truncate">{comment.user.username}:</span>
        <span className="truncate">
          <TextHighlighter text={comment.body} highlight={searchQuery} />
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={() => onLike(comment.id)}>
          <ThumbsUp className="w-3 h-3" />
          <span className="ml-1 text-xs">{comment.likes || 0}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(comment)}>
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};