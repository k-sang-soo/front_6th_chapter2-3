import { Post } from '../../../../entities/post/model';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  Button,
} from '../../../../shared/ui';

interface EditPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onPostChange: (post: Post) => void;
  onSubmit: (postId: number) => void;
  isLoading?: boolean;
}

export const EditPostForm = ({
  open,
  onOpenChange,
  post,
  onPostChange,
  onSubmit,
  isLoading = false,
}: EditPostFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게시물 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="제목"
            value={post?.title || ''}
            onChange={(e) => {
              if (!post) return;
              onPostChange({ ...post, title: e.target.value });
            }}
          />
          <Textarea
            rows={15}
            placeholder="내용"
            value={post?.body || ''}
            onChange={(e) => {
              if (!post) return;
              onPostChange({ ...post, body: e.target.value });
            }}
          />
          <Button
            onClick={() => {
              if (!post?.id) return;
              onSubmit(post.id);
            }}
            disabled={isLoading || !post?.id}
          >
            {isLoading ? '업데이트 중...' : '게시물 업데이트'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};