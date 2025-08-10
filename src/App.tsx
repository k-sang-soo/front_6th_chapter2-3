/**
 * 메인 App 컴포넌트
 * - 전체 애플리케이션의 레이아웃 구조 정의
 * - 라우터 설정 및 전역 레이아웃 관리
 * - Header, Footer, Main 컨텐츠 영역으로 구성
 * - 현재는 PostsManagerPage만 렌더링 (단일 페이지 구조)
 */
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import PostsManagerPage from './pages/PostsManagerPage.tsx';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <PostsManagerPage />
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
