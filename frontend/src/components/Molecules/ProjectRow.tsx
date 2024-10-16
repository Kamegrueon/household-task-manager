// src/components/Molecules/ProjectRow.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TableRow from '../Atoms/TableRow';
import TableCell from '../Atoms/TableCell';
import IconButton from './IconButton';

interface Project {
  id: number;
  name: string;
  description: string;
}

interface ProjectRowProps {
  project: Project;
  onEdit: (projectId: number) => void;
  onDelete: (projectId: number) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/projects/${project.id}/tasks/due`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 行のクリックイベントを停止
    onEdit(project.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 行のクリックイベントを停止
    onDelete(project.id);
  };

  return (
    <TableRow onClick={handleRowClick}>
      <TableCell className="text-left">
        {project.name}
      </TableCell>
      <TableCell className="text-left">
        {project.description}
      </TableCell>
      <TableCell className="text-center">
        {/* 編集ボタン */}
        <IconButton
          onClick={handleEditClick}
          iconName="Edit" // 'Settings' から 'Edit' に変更
          title="編集"
          className="mx-auto text-[#4CAF50] hover:text-green-700"
          size={16}
        />
      </TableCell>
      <TableCell className="text-center">
        {/* 削除ボタン */}
        <IconButton
          onClick={handleDeleteClick}
          iconName="Trash" // 'Home' から 'Trash' に変更
          title="削除"
          className="mx-auto text-red-500 hover:text-red-700"
          size={16}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProjectRow;
