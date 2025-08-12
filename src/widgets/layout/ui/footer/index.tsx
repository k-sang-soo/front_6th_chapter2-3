/**
 * 애플리케이션 하단 푸터 컴포넌트
 * - 저작권 정보 표시
 * - 페이지 하단에 고정 배치
 * - 간단한 정보 제공용 컴포넌트
 */
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2023 Post Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
