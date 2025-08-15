import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextHighlighter,
} from '../../../../shared/ui';
import { Edit2, MessageSquare, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Post, PostWithAuthor, PostRequest } from '../../../../entities/post/model';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, memo } from 'react';
import { postQueries } from '../../../../entities/post/queries';

interface PostTableContainerProps {
  filters: PostRequest;
  onTagSelect: (tag: string) => void;
  onUserModalOpen: (user: PostWithAuthor['author']) => void;
  onPostDetailOpen: (post: Post) => void;
  onPostDelete: (postId: Post['id']) => void;
  onEditDialogOpen: (show: boolean) => void;
  onPostSelect: (post: Post) => void;
  onTotalChange: (total: number) => void;
}

const PostTableContainerComponent = ({
  filters,
  onTagSelect,
  onUserModalOpen,
  onPostDetailOpen,
  onPostDelete,
  onEditDialogOpen,
  onPostSelect,
  onTotalChange,
}: PostTableContainerProps) => {
  const { data } = useSuspenseQuery(postQueries.postsWithAuthors(filters));
  const posts = data.posts;

  // total 값이 변경되면 상위 컴포넌트에 알림
  useEffect(() => {
    onTotalChange(data.total);
  }, [data.total, onTotalChange]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">ID</TableHead>
          <TableHead>제목</TableHead>
          <TableHead className="w-[150px]">작성자</TableHead>
          <TableHead className="w-[150px]">반응</TableHead>
          <TableHead className="w-[150px]">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>{post.id}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div>
                  <TextHighlighter text={post.title} highlight={filters.searchQuery || ''} />
                </div>

                <div className="flex flex-wrap gap-1">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className={`px-1 text-[9px] font-semibold rounded-[4px] cursor-pointer ${
                        filters.selectedTag === tag
                          ? 'text-white bg-blue-500 hover:bg-blue-600'
                          : 'text-blue-800 bg-blue-100 hover:bg-blue-200'
                      }`}
                      onClick={() => {
                        onTagSelect(tag);
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => onUserModalOpen(post.author)}
              >
                <img
                  src={post.author?.image}
                  alt={post.author?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{post.author?.username}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.reactions?.likes || 0}</span>
                <ThumbsDown className="w-4 h-4" />
                <span>{post.reactions?.dislikes || 0}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onPostDetailOpen(post)}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onPostSelect(post);
                    onEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPostDelete(post.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// 메모이제이션으로 불필요한 리렌더링 방지
export const PostTableContainer = memo(PostTableContainerComponent);
