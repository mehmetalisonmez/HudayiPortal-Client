// ──────────────────────────────────────────────
// Chat API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import type { ChatListItem, ChatUser, CreateGroupRequest, MarkReadRequest, MesajDto, GroupMember } from '../types';

export const chatService = {
  /** Kullanıcının dahil olduğu sohbet gruplarını ve DM listesini getirir */
  getGroups: () =>
    api.get<ChatListItem[]>('/chat/groups'),

  /** Seçilen sohbetin geçmiş mesajlarını getirir */
  getMessages: (groupIdOrUserId: number, isGroup: boolean) =>
    api.get<MesajDto[]>(`/chat/messages/${groupIdOrUserId}`, {
      params: { isGroup },
    }),

  /** Yeni bir sohbet grubu oluşturur */
  createGroup: (data: CreateGroupRequest) =>
    api.post<number>('/chat/groups', data),

  /** Sohbet mesajlarını okundu olarak işaretler */
  markRead: (data: MarkReadRequest) =>
    api.post<void>('/chat/messages/mark-read', data),

  /** Sohbet başlatılabilecek diğer sistem kullanıcılarını listeler */
  getUsers: () =>
    api.get<ChatUser[]>('/chat/users'),

  /** Seçilen sohbet grubunun üyelerini listeler */
  getGroupMembers: (groupId: number) =>
    api.get<GroupMember[]>(`/chat/groups/${groupId}/members`),
};
