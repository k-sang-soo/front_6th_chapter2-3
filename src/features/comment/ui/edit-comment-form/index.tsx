import { Comment } from '../../../../entities/comment/model';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
  Button,
} from '../../../../shared/ui';

interface EditCommentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: Comment | null;
  onCommentChange: (comment: Comment) => void;
  onSubmit: (commentId: number, body: string) => void;
  isLoading?: boolean;
}

export const EditCommentForm = ({
  open,
  onOpenChange,
  comment,
  onCommentChange,
  onSubmit,
  isLoading = false,
}: EditCommentFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>댓글 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="댓글 내용"
            value={comment?.body || ''}
            onChange={(e) => {
              if (!comment) return;
              onCommentChange({ ...comment, body: e.target.value });
            }}
          />
          <Button
            onClick={() => {
              if (!comment?.id || !comment.body.trim()) return;
              onSubmit(comment.id, comment.body);
            }}
            disabled={isLoading || !comment?.id || !comment?.body.trim()}
          >
            {isLoading ? '업데이트 중...' : '댓글 업데이트'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};