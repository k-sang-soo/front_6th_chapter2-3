import { PostWithAuthor } from '../../../entities/post/model';
import { UserProfile } from '../../../entities/user/model';
import { useUserStore } from '../../../entities/user/store/useUserStore';

export const useUserManagement = () => {
  const {
    setSelectedUser,
    openProfileModal: openUserProfileModal,
  } = useUserStore();

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

  return {
    openUserModal,
  };
};