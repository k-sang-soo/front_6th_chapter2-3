/**
 * 메인 App 컴포넌트
 * - 전체 애플리케이션의 레이아웃 구조 정의
 * - 라우터 설정 및 전역 레이아웃 관리
 * - Header, Footer, Main 컨텐츠 영역으로 구성
 * - 현재는 PostsManagerPage만 렌더링 (단일 페이지 구조)
 */
import { BrowserRouter as Router } from 'react-router-dom';
import PostsManagerPage from './pages/PostsManagerPage.tsx';
import { DefaultLayout } from './widgets/ui/layout';

const App = () => {
  return (
    <Router>
      <DefaultLayout>
        <PostsManagerPage />
      </DefaultLayout>
    </Router>
  );
};

export default App;
