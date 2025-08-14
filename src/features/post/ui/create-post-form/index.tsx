import { PostFormData } from '../../../../entities/post/model';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  Button,
} from '../../../../shared/ui';

interface CreatePostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PostFormData;
  onFormDataChange: (data: PostFormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const CreatePostForm = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
}: CreatePostFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 게시물 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="제목"
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
          />
          <Textarea
            rows={30}
            placeholder="내용"
            value={formData.body}
            onChange={(e) => onFormDataChange({ ...formData, body: e.target.value })}
          />
          <Input
            type="number"
            placeholder="사용자 ID"
            value={formData.userId}
            onChange={(e) => onFormDataChange({ ...formData, userId: Number(e.target.value) })}
          />
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? '추가 중...' : '게시물 추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};