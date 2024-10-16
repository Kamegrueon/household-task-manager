import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import ProjectMemberList from '../ProjectMembers/ProjectMemberList';

interface ProjectModalProps {
    isOpen: boolean;
    toggleModal: () => void;
    project_id: string | undefined;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, toggleModal, project_id }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={toggleModal}
            contentLabel="プロジェクト設定"
            className="hidden fixed top-0 right-0 h-full bg-white shadow-lg p-6 outline-none w-4/5 sm:w-3/5 md:w-1/3 transition-transform transform"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
        >
            <h2 className="screen-title mb-4 text-gray-800">プロジェクト設定</h2>
            {project_id && (
                <ProjectMemberList 
                    projectId={parseInt(project_id, 10)} 
                    isOpen={isOpen} 
                    onRequestClose={toggleModal} 
                />
            )}
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

export default ProjectModal;
