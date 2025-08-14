import { Post } from '../../../../entities/post/model';
import { Comment } from '../../../../entities/comment/model';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  TextHighlighter,
} from '../../../../shared/ui';
import { CommentList } from '../../../../widgets/comment/ui';

interface PostDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  comments: Comment[];
  searchQuery: string;
  onAddComment: (postId: number) => void;
  onEditComment: (comment: Comment) => void;
  onDeleteComment: (commentId: number) => void;
  onLikeComment: (commentId: number) => void;
}

export const PostDetail = ({
  open,
  onOpenChange,
  post,
  comments,
  searchQuery,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
}: PostDetailProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <TextHighlighter text={post?.title} highlight={searchQuery} />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <TextHighlighter text={post?.body} highlight={searchQuery} />
          </p>
          <CommentList
            postId={post?.id}
            comments={comments}
            searchQuery={searchQuery}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            onLikeComment={onLikeComment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};