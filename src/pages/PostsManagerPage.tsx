import { Plus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../shared/ui';
import { Post } from '../entities/post/model';
import { Comment, CommentFormData } from '../entities/comment/model';
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
import { usePostManagement } from '../features/post/hooks/usePostManagement';
import { useCommentManagement } from '../features/comment/hooks/useCommentManagement';
import { useUserManagement } from '../features/user/hooks/useUserManagement';

const PostsManager = () => {
  // Filters Hook
  const { filters, updateFilters, total, setTotal } = usePostFilters();

  // Post Management Hook
  const {
    addPost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    openPostDetail,
    newPost,
    setNewPost,
    isCreating,
    isUpdating,
  } = usePostManagement();

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

  // Selected Post Comments Data
  const { data: commentsData } = useQuery({
    ...commentQueries.byPost({
      postId: selectedPost?.id || 0,
    }),
    enabled: !!selectedPost?.id,
  });
  const comments = commentsData?.comments || [];

  // Comment Management Hook
  const {
    addComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    likeComment: handleLikeComment,
    newComment,
    setNewComment,
    isCreating: isCreatingComment,
    isUpdating: isUpdatingComment,
  } = useCommentManagement(selectedPost, comments);

  // User Management Hook
  const { openUserModal } = useUserManagement();

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
    openProfileModal: openUserProfileModal,
    closeProfileModal: closeUserProfileModal,
  } = useUserStore();

  // === 상태 관리 === //
  // 폼 상태들은 이제 각각의 hook에서 관리됨

  // === TanStack Query로 데이터 가져오기 === //

  // 태그 목록 쿼리
  const { data: tagsData } = useQuery(tagQueries.list());
  const tags = tagsData || [];

  // === 유틸리티 함수 === //

  // Post CRUD actions - hook에서 직접 처리됨

  const updatePost = (postId: Post['id']) => {
    if (!selectedPost) return;

    const postData = {
      title: selectedPost.title,
      body: selectedPost.body,
      userId: selectedPost.userId,
    };

    handleUpdatePost(postId, postData);
  };

  // Comment CRUD actions
  const updateComment = (commentId: Comment['id'], commentData: Pick<CommentFormData, 'body'>) => {
    handleUpdateComment(commentId, commentData);
  };

  const deleteComment = (commentId: Comment['id']) => {
    handleDeleteComment(commentId);
  };

  const likeComment = (commentId: Comment['id']) => {
    handleLikeComment(commentId);
  };

  // === UI 상호작용 함수들 === //

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
              onTagChange={(tag) => updateFilters({ selectedTag: tag === 'all' ? '' : tag })}
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
              onPostDelete={handleDeletePost}
              onEditDialogOpen={() => openPostEditModal()}
              onPostSelect={setSelectedPost}
              onTotalChange={setTotal}
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
        isLoading={isCreating}
      />

      {/* 게시물 수정 대화상자 */}
      <EditPostForm
        open={postModals.edit}
        onOpenChange={(open) => (open ? openPostEditModal() : closePostEditModal())}
        post={selectedPost}
        onPostChange={setSelectedPost}
        onSubmit={updatePost}
        isLoading={isUpdating}
      />

      {/* 댓글 추가 대화상자 */}
      <CreateCommentForm
        open={commentModals.add}
        onOpenChange={(open) => (open ? openCommentAddModal() : closeCommentAddModal())}
        formData={newComment}
        onFormDataChange={setNewComment}
        onSubmit={(commentData) => addComment(commentData)}
        isLoading={isCreatingComment}
      />

      {/* 댓글 수정 대화상자 */}
      <EditCommentForm
        open={commentModals.edit}
        onOpenChange={(open) => (open ? openCommentEditModal() : closeCommentEditModal())}
        comment={selectedComment}
        onCommentChange={setSelectedComment}
        onSubmit={(commentId, body) => updateComment(commentId, { body })}
        isLoading={isUpdatingComment}
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
