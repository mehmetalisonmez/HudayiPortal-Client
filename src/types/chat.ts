// ──────────────────────────────────────────────
// Chat Tipleri (Sohbet Grupları ve Direct Messages)
// ──────────────────────────────────────────────

export interface ChatListItem {
  id: number;
  name: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: string | null;
  lastMessageDate: string | null; // ISO 8601
  unreadCount: number;
}

export interface ChatUser {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  rolAdi: string;
}

export interface CreateGroupRequest {
  grupAdi: string;
  grupResmiUrl?: string | null;
  kullaniciIds: number[];
}

export interface MarkReadRequest {
  chatGrupId?: number | null;
  aliciId?: number | null;
}

export interface GroupMember {
  kullaniciId: number;
  adSoyad: string;
  profilResmiUrl: string | null;
  rolAdi: string;
  isAdmin: boolean;
}
