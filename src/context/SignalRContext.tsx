// ──────────────────────────────────────────────
// SignalR Context — Gerçek Zamanlı Soket ve Cache Yönetimi
// ──────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { HubConnectionBuilder, HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import type { MesajDto, ChatListItem } from "../types";

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  sendMessage: (aliciId: number | null, chatGrupId: number | null, content: string) => Promise<void>;
  activeChat: { id: number; isGroup: boolean } | null;
  setActiveChat: (chat: { id: number; isGroup: boolean } | null) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR, bir SignalRProvider içinde kullanılmalıdır.");
  }
  return context;
};

interface SignalRProviderProps {
  children: React.ReactNode;
}

export const SignalRProvider = ({ children }: SignalRProviderProps) => {
  const { isAuthenticated, token, user } = useAuth();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: number; isGroup: boolean } | null>(null);

  const queryClient = useQueryClient();
  const currentUserId = user?.sub ? parseInt(user.sub) : null;

  // SignalR Bağlantı Döngüsü
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl("/chathub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("SignalR Hub Bağlantısı Başarılı");
        setIsConnected(true);
        setConnection(newConnection);
      })
      .catch((err) => {
        console.error("SignalR Hub Bağlantı Hatası: ", err);
        setIsConnected(false);
      });

    newConnection.onreconnecting(() => {
      console.warn("SignalR Reconnecting...");
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log("SignalR Reconnected successfully");
      setIsConnected(true);
    });

    newConnection.onclose(() => {
      console.warn("SignalR Connection Closed");
      setIsConnected(false);
    });

    return () => {
      newConnection.stop();
    };
  }, [isAuthenticated, token]);

  // Soket Mesaj Dinleyicileri (Anlık Cache Senkronizasyonu)
  useEffect(() => {
    if (!connection || !currentUserId) return;

    // 1. Yeni Mesaj Geldiğinde
    connection.on("ReceiveMessage", (message: MesajDto) => {
      console.log("Soketten yeni mesaj alındı: ", message);

      const isGroup = !!message.chatGrupId;
      const chatPartnerId = isGroup
        ? message.chatGrupId!
        : message.gonderenId === currentUserId
        ? message.aliciId!
        : message.gonderenId;

      // A. Mesaj Geçmişi Cache'ini Güncelle (Optimistic UI)
      queryClient.setQueryData<MesajDto[]>(
        ["chat", "messages", chatPartnerId, isGroup],
        (oldMessages = []) => {
          if (oldMessages.some((m) => m.id === message.id)) return oldMessages;
          return [...oldMessages, message];
        }
      );

      // B. Sol Sohbet Listesi Cache'ini Güncelle ve Sırala
      queryClient.setQueryData<ChatListItem[]>(["chat", "groups"], (oldList = []) => {
        const existingIndex = oldList.findIndex(
          (item) => item.id === chatPartnerId && item.isGroup === isGroup
        );

        let updatedItem: ChatListItem;
        const newList = [...oldList];

        if (existingIndex !== -1) {
          const existingItem = oldList[existingIndex];
          const isCurrentActive =
            activeChat?.id === chatPartnerId && activeChat?.isGroup === isGroup;

          updatedItem = {
            ...existingItem,
            lastMessage: message.mesajIcerigi,
            lastMessageDate: message.olusturulmaTarihi,
            unreadCount: isCurrentActive
              ? 0
              : message.gonderenId === currentUserId
              ? existingItem.unreadCount
              : existingItem.unreadCount + 1,
          };
          newList.splice(existingIndex, 1);
        } else {
          // Eğer sol listede henüz yoksa (yeni sohbet başladıysa) listenin yenilenmesini tetikle
          queryClient.invalidateQueries({ queryKey: ["chat", "groups"] });
          return oldList;
        }

        return [updatedItem, ...newList];
      });
    });

    // 2. Yeni Grup Oluşturulduğunda
    connection.on("ChatGroupCreated", () => {
      // Sohbet listesi cache'ini geçersiz kıl ve yeniden yüklet
      queryClient.invalidateQueries({ queryKey: ["chat", "groups"] });
    });

    return () => {
      connection.off("ReceiveMessage");
      connection.off("ChatGroupCreated");
    };
  }, [connection, currentUserId, activeChat, queryClient]);

  // Hub Üzerinden Mesaj Gönderme
  const sendMessage = useCallback(
    async (aliciId: number | null, chatGrupId: number | null, content: string) => {
      if (!connection || connection.state !== HubConnectionState.Connected) {
        throw new Error("SignalR bağlantısı aktif değil.");
      }

      await connection.invoke("SendMessageAsync", {
        aliciId,
        chatGrupId,
        mesajIcerigi: content,
      });
    },
    [connection]
  );

  const value: SignalRContextType = {
    connection,
    isConnected,
    sendMessage,
    activeChat,
    setActiveChat,
  };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
};
