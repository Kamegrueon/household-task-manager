import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

interface MenuModalProps {
    isOpen: boolean;
    toggleModal: () => void;
    isValidProjectId: boolean;
    project_id: string | undefined;
    toggleProjectModal: () => void;  // プロジェクトモーダルを開く関数を追加
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, toggleModal, isValidProjectId, project_id, toggleProjectModal }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={toggleModal}
            contentLabel="メニュー"
            className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 outline-none w-4/5 sm:w-3/5 md:w-1/3 transition-transform transform"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
        >
            <h2 className="text-lg font-bold mb-4 text-gray-800">Menu</h2>
            <div className="flex flex-col space-y-4">
                {isValidProjectId && project_id && (
                    <button
                        onClick={() => {
                            toggleModal();
                            toggleProjectModal();  // プロジェクトモーダルを開く
                        }}
                        className="py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md text-left"
                    >
                        メンバー管理
                    </button>
                )}
                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        isActive
                            ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                            : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                    }
                    onClick={toggleModal}
                >
                    アカウント設定
                </NavLink>
            </div>
            <button
                onClick={toggleModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                title="閉じる"
            >
                <FaTimes size={20} />
            </button>
        </Modal>
    );
};

export default MenuModal;
