// frontend/src/services/projectMemberApi.ts

import api from './api';
import { ProjectMemberCreate, ProjectMemberUpdate, ProjectMemberResponse } from '../types';

const getProjectMembers = async (projectId: number): Promise<ProjectMemberResponse[]> => {
    const response = await api.get<ProjectMemberResponse[]>(`/projects/${projectId}/members/`);
    return response.data;
};

const createProjectMember = async (projectId: number, member: ProjectMemberCreate): Promise<ProjectMemberResponse> => {
    const response = await api.post<ProjectMemberResponse>(`/projects/${projectId}/members/`, member);
    return response.data;
};

const updateProjectMember = async (projectId: number, memberId: number, memberUpdate: ProjectMemberUpdate): Promise<ProjectMemberResponse> => {
    const response = await api.put<ProjectMemberResponse>(`/projects/${projectId}/members/${memberId}`, memberUpdate);
    return response.data;
};

const deleteProjectMember = async (projectId: number, memberId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
};

export {
    getProjectMembers,
    createProjectMember,
    updateProjectMember,
    deleteProjectMember
};
