/**
 * 메인 App 컴포넌트
 * - 전체 애플리케이션의 레이아웃 구조 정의
 * - 라우터 설정 및 전역 레이아웃 관리
 * - QueryClient 프로바이더를 통한 전역 상태 관리
 * - Header, Footer, Main 컨텐츠 영역으로 구성
 * - 현재는 PostsManagerPage만 렌더링 (단일 페이지 구조)
 */
import { BrowserRouter as Router } from 'react-router-dom';
import PostsManagerPage from './pages/PostsManagerPage.tsx';
import { DefaultLayout } from './widgets/layout/ui';
import { QueryProvider } from './app/providers/query-client';

const App = () => {
  return (
    <QueryProvider>
      <Router>
        <DefaultLayout>
          <PostsManagerPage />
        </DefaultLayout>
      </Router>
    </QueryProvider>
  );
};

export default App;
