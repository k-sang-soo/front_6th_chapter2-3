/**
 * 📚 PostsManagerPage.tsx - 리팩토링 학습용 레거시 코드
 *
 * 🚨 현재 상태: 726줄의 거대한 모놀리식 컴포넌트 (안티패턴)
 *
 * 주요 문제점들:
 * 1. 하나의 컴포넌트가 너무 많은 책임을 가짐 (SRP 위반)
 * 2. 17개의 상태 변수가 무질서하게 관리됨
 * 3. 비즈니스 로직과 UI 로직이 섞임
 * 4. 적절한 TypeScript 타이핑 부족
 * 5. 재사용 불가능한 구조
 *
 * 🎯 학습 목표: 이 코드를 FSD 아키텍처로 리팩토링하면서
 * 관심사 분리, 상태 관리, 컴포넌트 분해 원칙을 익히기
 */

import { useState, useMemo, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  TextHighlighter,
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
import { CommentList } from '../widgets/comment/ui';

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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="게시물 검색..."
                  className="pl-8"
                  value={filters.searchQuery}
                  onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && console.log('Enter 검색: PostTableContainer에서 처리')
                  }
                />
              </div>
            </div>
            <Select
              value={filters.selectedTag}
              onValueChange={(value) => updateFilters({ selectedTag: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="태그 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 태그</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.url} value={tag.slug}>
                    {tag.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="title">제목</SelectItem>
                <SelectItem value="reactions">반응</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) =>
                updateFilters({ sortOrder: value === 'desc' ? 'desc' : 'asc' })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="정렬 순서" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">오름차순</SelectItem>
                <SelectItem value="desc">내림차순</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>표시</span>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => updateFilters({ limit: Number(value) })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
              <span>항목</span>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={filters.skip === 0}
                onClick={() => updateFilters({ skip: Math.max(0, filters.skip - filters.limit) })}
              >
                이전
              </Button>
              <Button
                disabled={filters.skip + filters.limit >= total}
                onClick={() => updateFilters({ skip: filters.skip + filters.limit })}
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 게시물 추가 대화상자 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 게시물 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="제목"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              rows={30}
              placeholder="내용"
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
            />
            <Input
              type="number"
              placeholder="사용자 ID"
              value={newPost.userId}
              onChange={(e) => setNewPost({ ...newPost, userId: Number(e.target.value) })}
            />
            <Button onClick={addPost}>게시물 추가</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 게시물 수정 대화상자 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시물 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="제목"
              value={selectedPost?.title || ''}
              onChange={(e) => {
                if (!selectedPost) return;
                setSelectedPost({ ...selectedPost, title: e.target.value });
              }}
            />
            <Textarea
              rows={15}
              placeholder="내용"
              value={selectedPost?.body || ''}
              onChange={(e) => {
                if (!selectedPost) return;
                setSelectedPost({ ...selectedPost, body: e.target.value });
              }}
            />
            <Button
              onClick={() => {
                if (!selectedPost || !selectedPost.id) return;
                updatePost(selectedPost.id);
              }}
            >
              게시물 업데이트
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 댓글 추가 대화상자 */}
      <Dialog open={showAddCommentDialog} onOpenChange={setShowAddCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 댓글 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="댓글 내용"
              value={newComment.body}
              onChange={(e) => setNewComment({ ...newComment, body: e.target.value })}
            />
            <Button onClick={() => addComment(newComment)}>댓글 추가</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 댓글 수정 대화상자 */}
      <Dialog open={showEditCommentDialog} onOpenChange={setShowEditCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="댓글 내용"
              value={selectedComment?.body || ''}
              onChange={(e) => {
                if (!selectedComment) return;
                setSelectedComment({ ...selectedComment, body: e.target.value });
              }}
            />
            <Button
              onClick={() => {
                if (!selectedComment || !selectedComment.id) return;
                updateComment(selectedComment.id, { body: selectedComment.body });
              }}
            >
              댓글 업데이트
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 게시물 상세 보기 대화상자 */}
      <Dialog open={showPostDetailDialog} onOpenChange={setShowPostDetailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {<TextHighlighter text={selectedPost?.title} highlight={filters.searchQuery} />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{<TextHighlighter text={selectedPost?.body} highlight={filters.searchQuery} />}</p>
            <CommentList
              postId={selectedPost?.id}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* 사용자 모달 */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={selectedUser?.image}
              alt={selectedUser?.username}
              className="w-24 h-24 rounded-full mx-auto"
            />
            <h3 className="text-xl font-semibold text-center">{selectedUser?.username}</h3>
            <div className="space-y-2">
              <p>
                <strong>이름:</strong> {selectedUser?.firstName} {selectedUser?.lastName}
              </p>
              <p>
                <strong>나이:</strong> {selectedUser?.age}
              </p>
              <p>
                <strong>이메일:</strong> {selectedUser?.email}
              </p>
              <p>
                <strong>전화번호:</strong> {selectedUser?.phone}
              </p>
              <p>
                <strong>주소:</strong> {selectedUser?.address?.address},{' '}
                {selectedUser?.address?.city}, {selectedUser?.address?.state}
              </p>
              <p>
                <strong>직장:</strong> {selectedUser?.company?.name} -{' '}
                {selectedUser?.company?.title}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostsManager;
