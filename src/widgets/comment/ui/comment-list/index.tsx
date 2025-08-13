import { Plus } from 'lucide-react';
import { Button } from '../../../../shared/ui';
import { Comment } from '../../../../entities/comment/model';
import { CommentItem } from '../../../../entities/comment/ui';

interface CommentListProps {
  postId?: number;
  comments: Comment[];
  searchQuery?: string;
  onAddComment: (postId: number) => void;
  onEditComment: (comment: Comment) => void;
  onDeleteComment: (commentId: number) => void;
  onLikeComment: (commentId: number) => void;
}

/**
 * CommentList - Widget UI Component
 *
 * 댓글 섹션의 전체 구조와 비즈니스 로직을 담당하는 컴포넌트
 * - 댓글 목록 컨테이너 역할
 * - 댓글 추가 버튼과 헤더 관리
 * - 개별 CommentItem들을 조합하여 전체 댓글 섹션 구성
 */
export const CommentList = ({
  postId,
  comments,
  searchQuery = '',
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
}: CommentListProps) => {
  if (!postId) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">댓글</h3>
        <Button size="sm" onClick={() => onAddComment(postId)}>
          <Plus className="w-3 h-3 mr-1" />
          댓글 추가
        </Button>
      </div>
      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            searchQuery={searchQuery}
            onLike={onLikeComment}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
          />
        ))}
      </div>
    </div>
  );
};
