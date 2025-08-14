import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../shared/ui';
import { Post, PostFormData, PostWithAuthor } from '../entities/post/model';
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
import { SortSelector, SortByType } from '../features/post/ui/sort-selector';
import { SortOrderSelector } from '../features/post/ui/sort-order-selector';
import { PaginationControl } from '../features/pagination/ui/pagination-control';
import { usePostStore } from '../entities/post/store/usePostStore';
import { useCommentStore } from '../entities/comment/store/useCommentStore';
import { useUserStore } from '../entities/user/store/useUserStore';
import { usePostFilters } from '../features/post/hooks/usePostFilters';

const PostsManager = () => {
  // Filters Hook
  const { filters, updateFilters } = usePostFilters();

  // Post UI Store
  const {
    selectedPost,
    modals: postModals,
    setSelectedPost,
    openAddModal: openPostAddModal,
    closeAddModal: closePostAddModal,
    openEditModal: openPostEditModal,
    closeEditModal: closePostEditModal,
    openDetailModal: openPostDetailModal,
    closeDetailModal: closePostDetailModal,
  } = usePostStore();

  // Comment Store
  const {
    selectedComment,
    modals: commentModals,
    setSelectedComment,
    openAddModal: openCommentAddModal,
    closeAddModal: closeCommentAddModal,
    openEditModal: openCommentEditModal,
    closeEditModal: closeCommentEditModal,
  } = useCommentStore();

  // User Store
  const {
    selectedUser,
    modals: userModals,
    setSelectedUser,
    openProfileModal: openUserProfileModal,
    closeProfileModal: closeUserProfileModal,
  } = useUserStore();

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

  // 새로 작성 중인 데이터 (폼 상태)
  const [newPost, setNewPost] = useState<PostFormData>({ title: '', body: '', userId: 1 }); // 새 게시물 작성 폼
  const [newComment, setNewComment] = useState<CommentFormData>({
    body: '',
    postId: 1,
    userId: 1,
  }); // 새 댓글 작성 폼

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
        closePostAddModal();
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
          closePostEditModal();
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
        closeCommentAddModal();
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
          closeCommentEditModal();
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
    openPostDetailModal();
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
      openUserProfileModal();
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>게시물 관리자</span>
          <Button onClick={openPostAddModal}>
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
              sortBy={filters.sortBy as SortByType}
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
              onEditDialogOpen={() => openPostEditModal()}
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
        open={postModals.add}
        onOpenChange={(open) => (open ? openPostAddModal() : closePostAddModal())}
        formData={newPost}
        onFormDataChange={setNewPost}
        onSubmit={addPost}
        isLoading={createPostMutation.isPending}
      />

      {/* 게시물 수정 대화상자 */}
      <EditPostForm
        open={postModals.edit}
        onOpenChange={(open) => (open ? openPostEditModal() : closePostEditModal())}
        post={selectedPost}
        onPostChange={setSelectedPost}
        onSubmit={updatePost}
        isLoading={updatePostMutation.isPending}
      />

      {/* 댓글 추가 대화상자 */}
      <CreateCommentForm
        open={commentModals.add}
        onOpenChange={(open) => (open ? openCommentAddModal() : closeCommentAddModal())}
        formData={newComment}
        onFormDataChange={setNewComment}
        onSubmit={addComment}
        isLoading={createCommentMutation.isPending}
      />

      {/* 댓글 수정 대화상자 */}
      <EditCommentForm
        open={commentModals.edit}
        onOpenChange={(open) => (open ? openCommentEditModal() : closeCommentEditModal())}
        comment={selectedComment}
        onCommentChange={setSelectedComment}
        onSubmit={(commentId, body) => updateComment(commentId, { body })}
        isLoading={updateCommentMutation.isPending}
      />

      {/* 게시물 상세 보기 대화상자 */}
      <PostDetail
        open={postModals.detail}
        onOpenChange={(open) => (open ? openPostDetailModal() : closePostDetailModal())}
        post={selectedPost}
        comments={comments}
        searchQuery={filters.searchQuery}
        onAddComment={(postId) => {
          setNewComment((prev) => ({ ...prev, postId }));
          openCommentAddModal();
        }}
        onEditComment={(comment) => {
          setSelectedComment(comment);
          openCommentEditModal();
        }}
        onDeleteComment={deleteComment}
        onLikeComment={likeComment}
      />

      {/* 사용자 모달 */}
      <UserProfileModal
        open={userModals.profile}
        onOpenChange={(open) => (open ? openUserProfileModal() : closeUserProfileModal())}
        user={selectedUser}
      />
    </Card>
  );
};

export default PostsManager;
