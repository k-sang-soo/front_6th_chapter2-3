import { CommentFormData } from '../../../../entities/comment/model';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
  Button,
} from '../../../../shared/ui';

interface CreateCommentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CommentFormData;
  onFormDataChange: (data: CommentFormData) => void;
  onSubmit: (data: CommentFormData) => void;
  isLoading?: boolean;
}

export const CreateCommentForm = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
}: CreateCommentFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 댓글 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="댓글 내용"
            value={formData.body}
            onChange={(e) => onFormDataChange({ ...formData, body: e.target.value })}
          />
          <Button onClick={() => onSubmit(formData)} disabled={isLoading || !formData.body.trim()}>
            {isLoading ? '추가 중...' : '댓글 추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};