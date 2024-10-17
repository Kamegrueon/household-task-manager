// src/components/Templates/Header.tsx

import React, { useState } from 'react';
import { useMatch, NavLink } from 'react-router-dom';
import LogoWithTitle from '../Molecules/LogoWithTitle';
import IconButton from '../Molecules/IconButton';
import NavBar from '../Organisms/NavBar';
import TabBar from '../Organisms/TabBar';
import ProjectModal from '../Organisms/ProjectModal';
import Icon from '../Atoms/Icon';
import MenuModal from '../Organisms/MenuModal';

interface HeaderProps {
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  const matchProject = useMatch('/projects/:project_id/*');
  const projectId = matchProject?.params.project_id;

  const toggleProjectModal = () => {
    setIsProjectModalOpen(!isProjectModalOpen);
  };

  const toggleMenuModal = () => {
    setIsMenuModalOpen(!isMenuModalOpen);
  };

  const isValidProjectId = (id?: string): boolean => {
    return id !== undefined && /^\d+$/.test(id);
  };


  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <NavLink to="/projects">
            <LogoWithTitle />
          </NavLink>

          <div className="flex items-center">
            {/* モバイルビュー用: サイズ 24 */}
            <IconButton
              onClick={toggleMenuModal}
              iconName="Menu"
              title="メニュー"
              size={24}
              className="block md:hidden"
            />

            {/* アカウントアイコン（デスクトップ表示時のみ） */}
            {isLoggedIn && (
              <NavLink
                to="/account"
                className="hidden md:block text-gray-600 hover:text-gray-800 ml-4"
                title="アカウント設定"
              >
                <Icon iconName="User" size={32} />
              </NavLink>
            )}
          </div>
        </div>

        {/* ナビゲーションバー（デスクトップ表示時のみ） */}
        {isValidProjectId(projectId) && (
          <NavBar projectId={projectId!} onProjectSettingsClick={toggleProjectModal} />
        )}
      </header>

      {/* タブバー（モバイル表示時のみ） */}
      {isValidProjectId(projectId) && <TabBar projectId={projectId!} />}

      {/* レスポンシブ時にのみ表示されるメニューモーダル */}
      <MenuModal
        isOpen={isMenuModalOpen}
        toggleModal={toggleMenuModal}
        isValidProjectId={isValidProjectId(projectId)}
        project_id={projectId}
        toggleProjectModal={toggleProjectModal}  // プロジェクトモーダルを開く関数を渡す
      />


      {/* プロジェクト設定モーダル */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        toggleModal={toggleProjectModal}
        project_id={projectId}
      />
    </>
  );
};

export default Header;
