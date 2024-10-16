// src/components/Organisms/ProjectTable.tsx

import React from 'react';
import Table from '../Atoms/Table';
import TableHeaderCell from '../Atoms/TableHeaderCell';
import ProjectRow from '../Molecules/ProjectRow';
import { ProjectResponse } from '../../types';

interface ProjectTableProps {
  projects: ProjectResponse[];
  onEdit: (projectId: number) => void;
  onDelete: (projectId: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <Table className="table-fixed">
      <thead>
        <tr>
          <TableHeaderCell className="w-1/4 text-left">プロジェクト名</TableHeaderCell>
          <TableHeaderCell className="w-2/4 text-left">説明</TableHeaderCell>
          <TableHeaderCell className="w-1/8 text-center" colSpan={2}></TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </Table>
  </div>
);

export default ProjectTable;
