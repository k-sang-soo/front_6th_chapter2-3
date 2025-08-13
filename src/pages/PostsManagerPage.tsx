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

import { useEffect, useState } from 'react';
import { Edit2, Plus, Search, ThumbsUp, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  Post,
  PostFormData,
  PostsResponse,
  PostWithAuthor,
  SortOrder,
} from '../entities/post/model';
import { Tag, TagFilterOption } from '../entities/tag/model';
import { UserProfile, UsersResponse } from '../entities/user/model';
import { Comment, CommentFormData, CommentsResponse } from '../entities/comment/model';
import { useCreatePost, useUpdatePost, useDeletePost } from '../features/post/mutations';
import FetchSuspense from '../shared/ui/boundaries/fetch-suspense/FetchSuspense.tsx';
import { PostTableContainer } from '../widgets/post/ui/post-table-container';

const PostsManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // TanStack Query mutations
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // === 상태 관리 === //

  // 게시물 목록과 관련된 서버 데이터
  const [posts, setPosts] = useState<PostWithAuthor[]>([]); // 현재 화면에 표시되는 게시물 목록
  const [total, setTotal] = useState(0); // 전체 게시물 개수 (페이지네이션용)
  const [loading, setLoading] = useState(false); // API 호출 중인지 표시
  const [tags, setTags] = useState<Tag[]>([]); // 사용 가능한 모든 태그 목록
  const [comments, setComments] = useState<Comment[]>([]); // 각 게시물별 댓글 저장 객체

  // 페이지네이션, 검색, 정렬을 위한 필터 상태
  const [skip, setSkip] = useState(parseInt(queryParams.get('skip') || '0')); // 페이지네이션: 건너뛸 항목 수
  const [limit, setLimit] = useState(parseInt(queryParams.get('limit') || '10')); // 페이지네이션: 페이지당 항목 수
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || ''); // 검색어
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || ''); // 정렬 기준 (id, title, reactions)
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const urlSortOrder = queryParams.get('sortOrder');
    return urlSortOrder === 'desc' ? 'desc' : 'asc'; // 타입 가드로 안전하게 처리
  }); // 정렬 순서 (오름차순/내림차순)
  const [selectedTag, setSelectedTag] = useState(queryParams.get('tag') || ''); // 선택된 태그 필터

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

  // === 유틸리티 함수 === //

  /**
   * 현재 필터 상태를 URL 파라미터로 변환하여 브라우저 주소창에 반영
   * 페이지 새로고침이나 뒤로가기 시에도 필터 상태가 유지됨
   */
  const updateURL = () => {
    const params = new URLSearchParams();
    if (skip) params.set('skip', skip.toString());
    if (limit) params.set('limit', limit.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (selectedTag) params.set('tag', selectedTag);
    navigate(`?${params.toString()}`);
  };

  // === API 호출 함수들 === //

  /**
   * 게시물 목록을 가져오는 함수
   * 1. 게시물 데이터를 페이지네이션과 함께 가져옴
   * 2. 사용자 데이터를 별도로 가져옴 (username, image만)
   * 3. 게시물에 작성자 정보를 결합해서 화면에 표시
   */
  const fetchPosts = () => {
    setLoading(true);
    let postsData: PostsResponse;
    let usersData: UsersResponse;

    fetch(`/api/posts?limit=${limit}&skip=${skip}&`)
      .then((response) => response.json())
      .then((data: PostsResponse) => {
        postsData = data;
        return fetch('/api/users?limit=0&select=username,image');
      })
      .then((response) => response.json())
      .then((users: UsersResponse) => {
        usersData = users;
        const postsWithUsers = postsData.posts.map((post) => ({
          ...post,
          author: usersData.users.find((user) => user.id === post.userId),
        }));
        setPosts(postsWithUsers);
        setTotal(postsData.total);
      })
      .catch((error) => {
        console.error('게시물 가져오기 오류:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 사용 가능한 모든 태그 목록을 가져와서 필터 드롭다운에 표시
   */
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/posts/tags');
      const data: Tag[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error('태그 가져오기 오류:', error);
    }
  };

  /**
   * 검색어로 게시물을 찾는 함수
   * 검색어가 비어있으면 전체 게시물을 다시 불러옴
   *
   * 🚨 주의: 이 함수는 레거시 코드입니다.
   * PostTableContainer에서는 TanStack Query를 사용하므로 이 함수는 Enter 키 검색에서만 사용됩니다.
   */
  const searchPosts = async () => {
    if (!searchQuery) {
      fetchPosts();
      return;
    }
    setLoading(true);
    try {
      // 기본값(limit=10, skip=0)을 사용하여 검색
      const response = await fetch(`/api/posts/search?q=${searchQuery}&limit=10&skip=0`);
      const data = await response.json();
      setPosts(data.posts);
      setTotal(data.total);
    } catch (error) {
      console.error('게시물 검색 오류:', error);
    }
    setLoading(false);
  };

  /**
   * 특정 태그로 필터링된 게시물을 가져오는 함수
   * 태그가 'all'이거나 없으면 전체 게시물을 불러옴
   */
  const fetchPostsByTag = async (tag: TagFilterOption) => {
    if (!tag || tag === 'all') {
      fetchPosts();
      return;
    }
    setLoading(true);
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        fetch(`/api/posts/tag/${tag}`),
        fetch('/api/users?limit=0&select=username,image'),
      ]);
      const postsData: PostsResponse = await postsResponse.json();
      const usersData: UsersResponse = await usersResponse.json();

      const postsWithUsers = postsData.posts.map((post) => ({
        ...post,
        author: usersData.users.find((user) => user.id === post.userId),
      }));

      setPosts(postsWithUsers);
      setTotal(postsData.total);
    } catch (error) {
      console.error('태그별 게시물 가져오기 오류:', error);
    }
    setLoading(false);
  };

  // === 게시물 CRUD 함수들 === //

  /**
   * 새 게시물을 생성하는 함수 (TanStack Query mutation 사용)
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
   * 선택된 게시물을 수정하는 함수 (TanStack Query mutation 사용)
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
   * 게시물을 삭제하는 함수 (TanStack Query mutation 사용)
   * 성공하면 쿼리 캐시가 자동으로 무효화되어 목록이 새로고침됨
   */
  const deletePost = (postId: Post['id']) => {
    deletePostMutation.mutate(postId);
  };

  // === 댓글 관련 함수들 === //

  /**
   * 특정 게시물의 댓글을 가져오는 함수
   * 이미 불러온 댓글이 있으면 중복 호출을 방지함 (캐시 역할)
   */
  const fetchComments = async (postId: Post['id']) => {
    try {
      const response = await fetch(`/api/comments/post/${postId}`);
      const data: CommentsResponse = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('댓글 가져오기 오류:', error);
    }
  };

  /**
   * 새 댓글을 추가하는 함수
   * 성공하면 해당 게시물의 댓글 목록에 추가하고 작성 폼을 초기화
   */
  const addComment = async (newComment: CommentFormData) => {
    try {
      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      const data = await response.json();
      setComments((prev) => [data, ...prev]);
      setShowAddCommentDialog(false);
      setNewComment({ body: '', postId: 1, userId: 1 });
    } catch (error) {
      console.error('댓글 추가 오류:', error);
    }
  };

  /**
   * 선택된 댓글을 수정하는 함수
   * 성공하면 댓글 목록에서 해당 댓글을 업데이트
   */
  const updateComment = async (updatedId: Comment['id'], updateComment: CommentFormData) => {
    if (!updatedId) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${updatedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: updateComment.body }),
      });
      const data = await response.json();
      setComments((prev) => {
        return prev.map((comment) => (comment.id === data.id ? data : comment));
      });
      setShowEditCommentDialog(false);
    } catch (error) {
      console.error('댓글 업데이트 오류:', error);
    }
  };

  /**
   * 댓글을 삭제하는 함수
   * 성공하면 해당 게시물의 댓글 목록에서 제거
   */
  const deleteComment = async (commentId: Comment['id']) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
    }
  };

  /**
   * 댓글에 좋아요를 추가하는 함수
   * 현재 좋아요 수에 1을 더해서 서버에 업데이트
   */
  const likeComment = async (commentId: Comment['id']) => {
    try {
      const targetComment = comments.find((comment) => comment.id === commentId);

      if (!targetComment) {
        console.error('댓글을 찾을 수 없습니다:', commentId);
        return;
      }

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likes: targetComment.likes + 1,
        }),
      });
      const data = await response.json();
      setComments((prev) => {
        return prev.map((comment) => (comment.id === data.id ? data : comment));
      });
    } catch (error) {
      console.error('댓글 좋아요 오류:', error);
    }
  };

  // === UI 상호작용 함수들 === //

  /**
   * 게시물 상세보기 다이얼로그를 여는 함수
   * 선택된 게시물을 설정하고 해당 게시물의 댓글을 불러온 후 다이얼로그 표시
   */
  const openPostDetail = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
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

  // 🚨 문제점 #3: useEffect 의존성 관리 문제 + 복잡한 사이드 이펙트
  // 👉 개선 방향: 커스텀 훅으로 분리하고 의존성을 명확히 관리

  // 초기 태그 로딩
  useEffect(() => {
    fetchTags();
  }, []); // ✅ 의존성 없음 - 한 번만 실행

  // 🔄 필터/페이지 변경 시 데이터 리로딩 + URL 동기화
  useEffect(() => {
    if (selectedTag) {
      fetchPostsByTag(selectedTag);
    } else {
      fetchPosts();
    }
    updateURL();
  }, [skip, limit, sortBy, sortOrder, selectedTag]);
  // 🚨 문제: fetchPosts, fetchPostsByTag, updateURL이 의존성에 없음!
  // ESLint exhaustive-deps 규칙 위반

  // 🌐 URL 파라미터를 상태로 동기화 (브라우저 뒤로가기 대응)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSkip(parseInt(params.get('skip') || '0'));
    setLimit(parseInt(params.get('limit') || '10'));
    setSearchQuery(params.get('search') || '');
    setSortBy(params.get('sortBy') || '');
    const urlSortOrder = params.get('sortOrder');
    setSortOrder(urlSortOrder === 'desc' ? 'desc' : 'asc');
    setSelectedTag(params.get('tag') || '');
  }, [location.search]); // ✅ location.search 의존성만 필요

  // 댓글 렌더링
  const renderComments = (postId: Post['id'] | undefined) => {
    if (!postId) return null;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">댓글</h3>
          <Button
            size="sm"
            onClick={() => {
              setNewComment((prev) => ({ ...prev, postId }));
              setShowAddCommentDialog(true);
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            댓글 추가
          </Button>
        </div>
        <div className="space-y-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-center justify-between text-sm border-b pb-1"
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <span className="font-medium truncate">{comment.user.username}:</span>
                <span className="truncate">
                  {<TextHighlighter text={comment.body} highlight={searchQuery} />}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => likeComment(comment.id)}>
                  <ThumbsUp className="w-3 h-3" />
                  <span className="ml-1 text-xs">{comment.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedComment(comment);
                    setShowEditCommentDialog(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
                />
              </div>
            </div>
            <Select
              value={selectedTag}
              onValueChange={(value) => {
                setSelectedTag(value);
                fetchPostsByTag(value);
                updateURL();
              }}
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
            <Select value={sortBy} onValueChange={setSortBy}>
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
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value === 'desc' ? 'desc' : 'asc')}
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
              filters={{
                limit,
                skip,
                searchQuery,
                selectedTag,
                sortBy,
                sortOrder,
              }}
              onTagSelect={setSelectedTag}
              onURLUpdate={updateURL}
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
              <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
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
              <Button disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - limit))}>
                이전
              </Button>
              <Button disabled={skip + limit >= total} onClick={() => setSkip(skip + limit)}>
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
                updateComment(selectedComment.id, newComment);
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
              {<TextHighlighter text={selectedPost?.title} highlight={searchQuery} />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{<TextHighlighter text={selectedPost?.body} highlight={searchQuery} />}</p>
            {renderComments(selectedPost?.id)}
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
