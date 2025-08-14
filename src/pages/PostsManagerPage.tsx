import { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../shared/ui';
import { Post, PostFormData, PostWithAuthor, SortOrder } from '../entities/post/model';
import { UserProfile } from '../entities/user/model';
import { Comment, CommentFormData } from '../entities/comment/model';
import { useCreatePost, useUpdatePost, useDeletePost } from '../features/post/mutations';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
} from '../features/comment/mutations';
import { commentQueries } from '../entities/comment/queries';
import { tagQueries } from '../entities/tag/queries';
import { useQuery } from '@tanstack/react-query';
import FetchSuspense from '../shared/ui/boundaries/fetch-suspense/FetchSuspense.tsx';
import { PostTableContainer } from '../widgets/post/ui/post-table-container';
import { CreatePostForm } from '../features/post/ui/create-post-form';
import { EditPostForm } from '../features/post/ui/edit-post-form';
import { PostDetail } from '../features/post/ui/post-detail';
import { CreateCommentForm } from '../features/comment/ui/create-comment-form';
import { EditCommentForm } from '../features/comment/ui/edit-comment-form';
import { UserProfile as UserProfileModal } from '../features/user/ui/user-profile';
import { PostSearch } from '../features/post/ui/post-search';
import { TagFilter } from '../features/post/ui/tag-filter';
import { SortSelector } from '../features/post/ui/sort-selector';
import { SortOrderSelector } from '../features/post/ui/sort-order-selector';
import { PaginationControl } from '../features/pagination/ui/pagination-control';

const PostsManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // TanStack Query mutations
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // Comment mutations
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();

  // === 상태 관리 === //

  // 게시물 목록과 관련된 서버 데이터 (현재 PostTableContainer에서 관리)
  const [total] = useState(0); // 전체 게시물 개수 (페이지네이션용) - PostTableContainer로 이동 예정

  // URL 파라미터에서 필터 상태 파싱 (Single Source of Truth)
  const filters = useMemo(
    () => ({
      skip: parseInt(searchParams.get('skip') || '0'),
      limit: parseInt(searchParams.get('limit') || '10'),
      searchQuery: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '',
      sortOrder: (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as SortOrder,
      selectedTag: searchParams.get('tag') || '',
    }),
    [searchParams],
  );

  // 필터 업데이트 함수
  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            newParams.delete(key === 'searchQuery' ? 'search' : key);
          } else {
            newParams.set(key === 'searchQuery' ? 'search' : key, String(value));
          }
        });

        return newParams;
      });
    },
    [setSearchParams],
  );

  // 현재 선택/편집 중인 항목들
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // 상세보기나 수정할 게시물
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null); // 수정할 댓글
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null); // 프로필을 볼 사용자

  // 새로 작성 중인 데이터 (폼 상태)
  const [newPost, setNewPost] = useState<PostFormData>({ title: '', body: '', userId: 1 }); // 새 게시물 작성 폼
  const [newComment, setNewComment] = useState<CommentFormData>({
    body: '',
    postId: 1,
    userId: 1,
  }); // 새 댓글 작성 폼

  // UI 모달/다이얼로그 표시 여부 제어
  const [showAddDialog, setShowAddDialog] = useState(false); // 게시물 추가 다이얼로그
  const [showEditDialog, setShowEditDialog] = useState(false); // 게시물 수정 다이얼로그
  const [showAddCommentDialog, setShowAddCommentDialog] = useState(false); // 댓글 추가 다이얼로그
  const [showEditCommentDialog, setShowEditCommentDialog] = useState(false); // 댓글 수정 다이얼로그
  const [showPostDetailDialog, setShowPostDetailDialog] = useState(false); // 게시물 상세보기 다이얼로그
  const [showUserModal, setShowUserModal] = useState(false); // 사용자 정보 모달

  // === TanStack Query로 데이터 가져오기 === //

  // 태그 목록 쿼리
  const { data: tagsData } = useQuery(tagQueries.list());
  const tags = tagsData || [];

  // 선택된 게시물의 댓글 쿼리
  const { data: commentsData } = useQuery({
    ...commentQueries.byPost({
      postId: selectedPost?.id || 0,
    }),
    enabled: !!selectedPost?.id, // selectedPost가 있을 때만 쿼리 실행
  });
  const comments = commentsData?.comments || [];

  // === 유틸리티 함수 === //

  // === 게시물 CRUD 함수들 === //

  /**
   * 새 게시물을 생성하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 목록이 새로고침됨
   */
  const addPost = () => {
    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        setShowAddDialog(false);
        setNewPost({ title: '', body: '', userId: 1 });
      },
    });
  };

  /**
   * 선택된 게시물을 수정하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 목록이 새로고침됨
   */
  const updatePost = (postId: Post['id']) => {
    if (!selectedPost) return;

    const postData = {
      title: selectedPost.title,
      body: selectedPost.body,
      userId: selectedPost.userId,
    };

    updatePostMutation.mutate(
      { postId, postData },
      {
        onSuccess: () => {
          setShowEditDialog(false);
        },
      },
    );
  };

  /**
   * 게시물을 삭제하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 목록이 새로고침됨
   */
  const deletePost = (postId: Post['id']) => {
    deletePostMutation.mutate(postId);
  };

  // === 댓글 관련 함수들 === //

  /**
   * 새 댓글을 추가하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 댓글 목록이 새로고침됨
   */
  const addComment = (newComment: CommentFormData) => {
    createCommentMutation.mutate(newComment, {
      onSuccess: () => {
        setShowAddCommentDialog(false);
        setNewComment({ body: '', postId: 1, userId: 1 });
      },
    });
  };

  /**
   * 선택된 댓글을 수정하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 댓글 목록이 새로고침됨
   */
  const updateComment = (commentId: Comment['id'], commentData: Pick<CommentFormData, 'body'>) => {
    if (!commentId) {
      return;
    }

    updateCommentMutation.mutate(
      { commentId, commentData },
      {
        onSuccess: () => {
          setShowEditCommentDialog(false);
        },
      },
    );
  };

  /**
   * 댓글을 삭제하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 댓글 목록이 새로고침됨
   */
  const deleteComment = (commentId: Comment['id']) => {
    // 현재 선택된 게시물의 ID를 가져와야 함
    if (!selectedPost?.id) {
      console.error('선택된 게시물이 없습니다');
      return;
    }

    deleteCommentMutation.mutate({
      commentId,
      postId: selectedPost.id,
    });
  };

  /**
   * 댓글에 좋아요를 추가하는 함수
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 댓글 목록이 새로고침됨
   */
  const likeComment = (commentId: Comment['id']) => {
    const targetComment = comments.find((comment) => comment.id === commentId);

    if (!targetComment || !selectedPost?.id) {
      console.error('댓글 또는 선택된 게시물을 찾을 수 없습니다:', commentId);
      return;
    }

    likeCommentMutation.mutate({
      commentId,
      likes: targetComment.likes + 1,
      postId: selectedPost.id,
    });
  };

  // === UI 상호작용 함수들 === //

  /**
   * 게시물 상세보기 다이얼로그를 여는 함수
   * 선택된 게시물을 설정하면 댓글이 자동으로 로드됨
   */
  const openPostDetail = (post: Post) => {
    setSelectedPost(post);
    setShowPostDetailDialog(true);
  };

  /**
   * 사용자 정보 모달을 여는 함수
   * 사용자의 상세 정보를 API로 가져온 후 모달에 표시
   */
  const openUserModal = async (user: PostWithAuthor['author']) => {
    try {
      if (!user || !user.id) return;

      const response = await fetch(`/api/users/${user.id}`);
      const userData: UserProfile = await response.json();
      setSelectedUser(userData);
      setShowUserModal(true);
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
    }
  };


  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>게시물 관리자</span>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            게시물 추가
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* 검색 및 필터 컨트롤 */}
          <div className="flex gap-4">
            <PostSearch
              searchQuery={filters.searchQuery}
              onSearchChange={(query) => updateFilters({ searchQuery: query })}
            />
            <TagFilter
              selectedTag={filters.selectedTag}
              tags={tags}
              onTagChange={(tag) => updateFilters({ selectedTag: tag })}
            />
            <SortSelector
              sortBy={filters.sortBy as any}
              onSortChange={(sortBy) => updateFilters({ sortBy })}
            />
            <SortOrderSelector
              sortOrder={filters.sortOrder}
              onSortOrderChange={(sortOrder) => updateFilters({ sortOrder })}
            />
          </div>

          {/* 게시물 테이블 */}

          <FetchSuspense
            loadingComponent={<div className="flex justify-center p-4">로딩 중...</div>}
          >
            <PostTableContainer
              filters={filters}
              onTagSelect={(tag) => updateFilters({ selectedTag: tag })}
              onUserModalOpen={openUserModal}
              onPostDetailOpen={openPostDetail}
              onPostDelete={deletePost}
              onEditDialogOpen={setShowEditDialog}
              onPostSelect={setSelectedPost}
            />
          </FetchSuspense>

          {/* 페이지네이션 */}
          <PaginationControl
            total={total}
            skip={filters.skip}
            limit={filters.limit}
            onLimitChange={(limit) => updateFilters({ limit, skip: 0 })}
            onSkipChange={(skip) => updateFilters({ skip })}
          />
        </div>
      </CardContent>

      {/* 게시물 추가 대화상자 */}
      <CreatePostForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        formData={newPost}
        onFormDataChange={setNewPost}
        onSubmit={addPost}
        isLoading={createPostMutation.isPending}
      />

      {/* 게시물 수정 대화상자 */}
      <EditPostForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        post={selectedPost}
        onPostChange={setSelectedPost}
        onSubmit={updatePost}
        isLoading={updatePostMutation.isPending}
      />

      {/* 댓글 추가 대화상자 */}
      <CreateCommentForm
        open={showAddCommentDialog}
        onOpenChange={setShowAddCommentDialog}
        formData={newComment}
        onFormDataChange={setNewComment}
        onSubmit={addComment}
        isLoading={createCommentMutation.isPending}
      />

      {/* 댓글 수정 대화상자 */}
      <EditCommentForm
        open={showEditCommentDialog}
        onOpenChange={setShowEditCommentDialog}
        comment={selectedComment}
        onCommentChange={setSelectedComment}
        onSubmit={(commentId, body) => updateComment(commentId, { body })}
        isLoading={updateCommentMutation.isPending}
      />

      {/* 게시물 상세 보기 대화상자 */}
      <PostDetail
        open={showPostDetailDialog}
        onOpenChange={setShowPostDetailDialog}
        post={selectedPost}
        comments={comments}
        searchQuery={filters.searchQuery}
        onAddComment={(postId) => {
          setNewComment((prev) => ({ ...prev, postId }));
          setShowAddCommentDialog(true);
        }}
        onEditComment={(comment) => {
          setSelectedComment(comment);
          setShowEditCommentDialog(true);
        }}
        onDeleteComment={deleteComment}
        onLikeComment={likeComment}
      />

      {/* 사용자 모달 */}
      <UserProfileModal
        open={showUserModal}
        onOpenChange={setShowUserModal}
        user={selectedUser}
      />
    </Card>
  );
};

export default PostsManager;
