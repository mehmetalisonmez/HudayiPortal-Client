// ──────────────────────────────────────────────
// ChatPage.tsx — Teams / WhatsApp Web Tarzında Premium Arayüz
// ──────────────────────────────────────────────

import React, { useState, useEffect, useRef, type FormEvent } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  alpha,
  Divider,
  Chip,
  Tooltip,
  Drawer,
} from "@mui/material";
import {
  SendOutlined,
  ChatOutlined,
  SearchOutlined,
  GroupsOutlined,
  ArrowBackIosNewOutlined,
  PersonAddAlt1Outlined,
  ForumOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useSignalR } from "../../context/SignalRContext";
import { chatService } from "../../api/chatService";
import type { ChatListItem, ChatUser, MesajDto } from "../../types";

const ChatPage = () => {
  const { user } = useAuth();
  const currentUserId = user?.sub ? parseInt(user.sub) : 0;
  const queryClient = useQueryClient();
  const { sendMessage, activeChat, setActiveChat } = useSignalR();

  // Arayüz state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Sohbet Grupları ve DM Listesi Sorgusu
  const { data: chatList = [], isLoading: isChatsLoading } = useQuery<ChatListItem[]>({
    queryKey: ["chat", "groups"],
    queryFn: () => chatService.getGroups().then((res) => res.data),
    refetchInterval: 15000, // 15 saniyede bir arkada senkronize et
  });

  // 2. Seçilen Sohbetin Mesaj Geçmişi Sorgusu
  const { data: messages = [], isLoading: isMessagesLoading } = useQuery<MesajDto[]>({
    queryKey: ["chat", "messages", activeChat?.id, activeChat?.isGroup],
    queryFn: () =>
      chatService.getMessages(activeChat!.id, activeChat!.isGroup).then((res) => res.data),
    enabled: !!activeChat,
    refetchInterval: 10000, // Mesajları 10 saniyede bir arkada yenile
  });

  // 3. Sistem Kullanıcıları Sorgusu (Dialog için)
  const { data: systemUsers = [], isLoading: isUsersLoading } = useQuery<ChatUser[]>({
    queryKey: ["chat", "users"],
    queryFn: () => chatService.getUsers().then((res) => res.data),
    enabled: isDialogOpen,
  });

  // 3.5. Seçilen Grubun Üye Listesi Sorgusu
  const { data: groupMembers = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ["chat", "members", activeChat?.id],
    queryFn: () => chatService.getGroupMembers(activeChat!.id).then((res) => res.data),
    enabled: !!activeChat && activeChat.isGroup && isMembersDrawerOpen,
  });

  // 4. Okundu İşaretleme Mutasyonu
  const markReadMutation = useMutation({
    mutationFn: (chat: { chatGrupId?: number | null; aliciId?: number | null }) =>
      chatService.markRead(chat),
    onSuccess: () => {
      // Okunmamış sayaçlarını yerel olarak sıfırlamak için sohbet listesi sorgusunu tazele
      queryClient.invalidateQueries({ queryKey: ["chat", "groups"] });
    },
  });

  // 5. Grup Oluşturma Mutasyonu
  const createGroupMutation = useMutation({
    mutationFn: (data: { grupAdi: string; kullaniciIds: number[] }) =>
      chatService.createGroup(data),
    onSuccess: (newGroupId) => {
      setIsDialogOpen(false);
      setGroupNameInput("");
      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ["chat", "groups"] });
      // Yeni gruba anında geçiş yapalım
      setActiveChat({ id: newGroupId.data, isGroup: true });
    },
  });

  // Sohbet seçildiğinde okundu işaretlemesi yapalım
  useEffect(() => {
    if (activeChat) {
      markReadMutation.mutate({
        chatGrupId: activeChat.isGroup ? activeChat.id : null,
        aliciId: activeChat.isGroup ? null : activeChat.id,
      });
    }
  }, [activeChat]);

  // Yeni mesaj geldiğinde veya mesajlar yüklendiğinde otomatik en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sayfa ilk açıldığında aktif sohbeti sıfırlayalım (her giriş yapıldığında temiz başlasın)
  useEffect(() => {
    setActiveChat(null);
  }, []);

  // Mesaj Gönderme Tetikleyicisi
  const handleSendMessageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const tempContent = messageInput.trim();
    setMessageInput(""); // Hızlıca input'u temizleyelim (UX)

    try {
      await sendMessage(
        activeChat.isGroup ? null : activeChat.id,
        activeChat.isGroup ? activeChat.id : null,
        tempContent
      );
      // scroll tetikle
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Mesaj gönderilemedi: ", err);
    }
  };

  // Yeni Birebir DM veya Grup Başlatma
  const handleStartChatOrGroup = async (userPartner: ChatUser) => {
    if (isGroupMode) {
      // Grup modundaysak seçilenleri check et
      setSelectedUserIds((prev) =>
        prev.includes(userPartner.id)
          ? prev.filter((id) => id !== userPartner.id)
          : [...prev, userPartner.id]
      );
    } else {
      // Birebir modundaysak doğrudan o sohbeti aç
      setIsDialogOpen(false);
      setActiveChat({ id: userPartner.id, isGroup: false });
    }
  };

  const handleGroupCreateSubmit = () => {
    if (!groupNameInput.trim() || selectedUserIds.length === 0) return;
    createGroupMutation.mutate({
      grupAdi: groupNameInput.trim(),
      kullaniciIds: [...selectedUserIds, currentUserId],
    });
  };

  // Sol listedeki aramaya göre sohbetleri filtreleme
  const filteredChats = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dialogdaki aramaya göre kullanıcıları filtreleme
  const filteredUsers = systemUsers.filter((u) =>
    `${u.ad} ${u.soyad}`.toLowerCase().includes(dialogSearch.toLowerCase())
  );

  // Seçilen aktif sohbetin bilgisini listeden bulalım
  const activeChatInfo = chatList.find(
    (c) => c.id === activeChat?.id && c.isGroup === activeChat?.isGroup
  );

  // Tarih biçimlendirme yardımcısı
  const formatChatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    
    // Aynı gün ise sadece saat
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    }
    
    // Farklı gün ise tarih
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <Box sx={{ height: "calc(100vh - 120px)", display: "flex", overflow: "hidden" }}>
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          display: "flex",
          borderRadius: 3,
          background: (t) => alpha(t.palette.background.paper, 0.4),
          backdropFilter: "blur(20px)",
          border: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
          overflow: "hidden",
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* ─── SOL SOHBET LİSTESİ PANELİ ─── */}
          <Grid
            item
            xs={12}
            md={4}
            lg={3.5}
            sx={{
              height: "100%",
              display: { xs: activeChat ? "none" : "flex", md: "flex" },
              flexDirection: "column",
              borderRight: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
            }}
          >
            {/* Üst Kısım Arama & Yeni Ekle */}
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mesajlarım
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PersonAddAlt1Outlined />}
                  onClick={() => {
                    setIsDialogOpen(true);
                    setIsGroupMode(false);
                  }}
                  sx={{ borderRadius: 2, textTransform: "none", fontSize: "0.8rem", py: 0.6 }}
                >
                  Yeni Sohbet
                </Button>
              </Box>

              <TextField
                size="small"
                placeholder="Konuşma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: (t) => alpha(t.palette.background.default, 0.5),
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined sx={{ color: "text.secondary", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.06) }} />

            {/* Sohbetlerin Aktığı Liste */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1, py: 1 }}>
              {isChatsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : filteredChats.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
                  <ForumOutlined sx={{ fontSize: 40, color: "text.secondary", opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Henüz bir sohbet kaydı bulunamadı.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredChats.map((chat) => {
                    const isSelected = activeChat?.id === chat.id && activeChat?.isGroup === chat.isGroup;
                    return (
                      <ListItemButton
                        key={`${chat.isGroup ? "g" : "u"}-${chat.id}`}
                        selected={isSelected}
                        onClick={() => setActiveChat({ id: chat.id, isGroup: chat.isGroup })}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          px: 1.5,
                          py: 1.2,
                          transition: "all 0.2s ease",
                          "&.Mui-selected": {
                            backgroundColor: (t) => alpha(t.palette.primary.main, 0.08),
                            "&:hover": {
                              backgroundColor: (t) => alpha(t.palette.primary.main, 0.12),
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <ListItemAvatar>
                            <Badge
                              color="error"
                              badgeContent={chat.unreadCount}
                              max={9}
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.68rem",
                                  height: 16,
                                  minWidth: 16,
                                },
                              }}
                            >
                              <Avatar
                                src={chat.avatar || undefined}
                                sx={{
                                  background: chat.isGroup
                                    ? "linear-gradient(135deg, #06B6D4, #4338CA)"
                                    : "linear-gradient(135deg, #6366F1, #06B6D4)",
                                  boxShadow: isSelected ? "0 4px 10px rgba(99, 102, 241, 0.3)" : "none",
                                }}
                              >
                                {chat.isGroup ? (
                                  <GroupsOutlined sx={{ fontSize: 20 }} />
                                ) : (
                                  chat.name.charAt(0).toUpperCase()
                                )}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: chat.unreadCount > 0 ? 700 : 600,
                                  fontSize: "0.88rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "70%",
                                }}
                              >
                                {chat.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                                {formatChatDate(chat.lastMessageDate)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: chat.unreadCount > 0 ? "text.primary" : "text.secondary",
                                fontWeight: chat.unreadCount > 0 ? 600 : 400,
                                fontSize: "0.78rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                mt: 0.3,
                              }}
                            >
                              {chat.lastMessage || "Sohbeti başlatın..."}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Box>
          </Grid>

          {/* ─── SAĞ SOHBET PENCERESİ PANELİ ─── */}
          <Grid
            item
            xs={12}
            md={8}
            lg={8.5}
            sx={{
              height: "100%",
              display: { xs: activeChat ? "flex" : "none", md: "flex" },
              flexDirection: "column",
              background: (t) => alpha(t.palette.background.default, 0.2),
            }}
          >
            {activeChat ? (
              <>
                {/* 1. Üst Başlık Barı */}
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderBottom: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
                    background: (t) => alpha(t.palette.background.paper, 0.5),
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setActiveChat(null)}
                    sx={{ display: { xs: "flex", md: "none" }, color: "text.secondary" }}
                  >
                    <ArrowBackIosNewOutlined sx={{ fontSize: 18 }} />
                  </IconButton>

                  <Avatar
                    src={activeChatInfo?.avatar || undefined}
                    sx={{
                      background: activeChat.isGroup
                        ? "linear-gradient(135deg, #06B6D4, #4338CA)"
                        : "linear-gradient(135deg, #6366F1, #06B6D4)",
                    }}
                  >
                    {activeChat.isGroup ? <GroupsOutlined /> : activeChatInfo?.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.98rem", lineHeight: 1.2 }}>
                      {activeChatInfo?.name || "Yükleniyor..."}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.8 }}>
                      {activeChat.isGroup ? "Grup Sohbeti" : "Birebir Sohbet"}
                    </Typography>
                  </Box>

                  {activeChat.isGroup && (
                    <Tooltip title="Grup Bilgisi / Üyeler" placement="bottom">
                      <IconButton
                        onClick={() => setIsMembersDrawerOpen(true)}
                        size="medium"
                        sx={{ color: "primary.main" }}
                      >
                        <GroupsOutlined />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* 2. Dikey Mesaj Alanı */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": {
                      background: (t) => alpha(t.palette.text.secondary, 0.1),
                      borderRadius: 3,
                    },
                  }}
                >
                  {isMessagesLoading ? (
                    <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
                      <CircularProgress size={32} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 0.6 }}>
                      <ChatOutlined sx={{ fontSize: 48, mb: 1.5 }} />
                      <Typography variant="body2">Henüz mesaj yazılmamış. İlk mesajı siz atın!</Typography>
                    </Box>
                  ) : (
                    messages.map((msg, index) => {
                      const isMyMessage = msg.gonderenId === currentUserId;
                      return (
                        <Box
                          key={msg.id || index}
                          sx={{
                            display: "flex",
                            justifyContent: isMyMessage ? "flex-end" : "flex-start",
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: { xs: "85%", sm: "70%", md: "60%" },
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMyMessage ? "flex-end" : "flex-start",
                            }}
                          >
                            {/* Grup sohbetinde gönderici adı */}
                            {!isMyMessage && activeChat.isGroup && (
                              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, mb: 0.5, ml: 1, fontSize: "0.72rem" }}>
                                {msg.gonderenAdSoyad}
                              </Typography>
                            )}

                            <Paper
                              elevation={0}
                              sx={{
                                px: 2,
                                py: 1.2,
                                borderRadius: isMyMessage ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                background: isMyMessage
                                  ? "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)"
                                  : (t) => (t.palette.mode === "dark" ? "#334155" : "#E2E8F0"),
                                color: isMyMessage ? "#fff" : "text.primary",
                                border: (t) => (isMyMessage ? "none" : `1px solid ${alpha(t.palette.text.secondary, 0.15)}`),
                                boxShadow: isMyMessage ? "0 4px 12px rgba(99, 102, 241, 0.15)" : "none",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.88rem",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  color: isMyMessage ? "#fff" : "text.primary",
                                }}
                              >
                                {msg.mesajIcerigi}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.65rem",
                                    color: isMyMessage ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                    fontWeight: 400,
                                  }}
                                >
                                  {msg.olusturulmaTarihi
                                    ? new Date(msg.olusturulmaTarihi).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
                                    : ""}
                                </Typography>
                              </Box>
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* 3. Mesaj Giriş Alanı */}
                <Box
                  component="form"
                  onSubmit={handleSendMessageSubmit}
                  sx={{
                    px: 3,
                    py: 2,
                    background: (t) => alpha(t.palette.background.paper, 0.5),
                    borderTop: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
                  }}
                >
                  <TextField
                    fullWidth
                    size="medium"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Bir mesaj yazın..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: (t) => alpha(t.palette.background.default, 0.5),
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="submit"
                              color="primary"
                              disabled={!messageInput.trim()}
                              sx={{
                                width: 40,
                                height: 40,
                                background: (t) =>
                                  messageInput.trim()
                                    ? `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`
                                    : "transparent",
                                color: (t) => (messageInput.trim() ? "#fff" : t.palette.text.secondary),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  background: (t) =>
                                    messageInput.trim()
                                      ? `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`
                                      : "transparent",
                                },
                              }}
                            >
                              <SendOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
              </>
            ) : (
              // Sohbet Seçilmediyse Görünecek Ekran (Placeholder)
              <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", px: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "50%",
                    background: (t) => alpha(t.palette.primary.main, 0.05),
                    color: "primary.main",
                    mb: 2.5,
                    animation: "pulse 3s infinite",
                  }}
                >
                  <ForumOutlined sx={{ fontSize: 56 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Sohbetlerinize Anında Erişin
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360, opacity: 0.8 }}>
                  Grup üyeleriyle veya dilediğiniz kişiyle doğrudan mesajlaşmaya başlayın. Sol menüden bir konuşma seçin veya yeni bir sohbet başlatın.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* ─── YENİ SOHBET / GRUP DIALOG EKRANI ─── */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: (t) => alpha(t.palette.background.paper, 0.95),
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isGroupMode ? "Yeni Grup Oluştur" : "Yeni Sohbet Başlat"}</span>
          <Button
            size="small"
            onClick={() => {
              setIsGroupMode(!isGroupMode);
              setSelectedUserIds([]);
              setGroupNameInput("");
            }}
            sx={{ textTransform: "none", fontSize: "0.78rem" }}
          >
            {isGroupMode ? "Birebir Sohbet" : "Grup Oluştur"}
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, px: 2.5 }}>
          {isGroupMode && (
            <TextField
              fullWidth
              size="small"
              label="Grup Adı"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            />
          )}

          <TextField
            fullWidth
            size="small"
            placeholder="Kullanıcı ara..."
            value={dialogSearch}
            onChange={(e) => setDialogSearch(e.target.value)}
            sx={{ mb: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ maxHeight: 280, overflowY: "auto", mt: 1.5 }}>
            {isUsersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Typography variant="body2" sx={{ textCenter: "center", color: "text.secondary", py: 3 }}>
                Aradığınız kullanıcı bulunamadı.
              </Typography>
            ) : (
              <List disablePadding>
                {filteredUsers.map((userPartner) => {
                  const isSelected = selectedUserIds.includes(userPartner.id);
                  return (
                    <ListItemButton
                      key={userPartner.id}
                      onClick={() => handleStartChatOrGroup(userPartner)}
                      sx={{ borderRadius: 2, mb: 0.5, py: 1 }}
                    >
                      {isGroupMode && (
                        <Checkbox checked={isSelected} sx={{ mr: 1, p: 0.5 }} />
                      )}
                      <ListItemAvatar sx={{ minWidth: 46 }}>
                        <Avatar sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #6366F1, #06B6D4)", fontSize: "0.8rem", fontWeight: 600 }}>
                          {userPartner.ad.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {userPartner.ad} {userPartner.soyad}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {userPartner.rolAdi} — {userPartner.email}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setIsDialogOpen(false)} color="inherit" sx={{ textTransform: "none" }}>
            İptal
          </Button>
          {isGroupMode && (
            <Button
              onClick={handleGroupCreateSubmit}
              variant="contained"
              disabled={!groupNameInput.trim() || selectedUserIds.length === 0 || createGroupMutation.isPending}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {createGroupMutation.isPending ? "Kuruluyor..." : "Grubu Kur"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ─── GRUP ÜYELERİ YAN PANELİ (DRAWER) ─── */}
      <Drawer
        anchor="right"
        open={isMembersDrawerOpen}
        onClose={() => setIsMembersDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 350 },
            background: (t) => alpha(t.palette.background.paper, 0.95),
            backdropFilter: "blur(15px)",
            borderLeft: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
            p: 3,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Grup Üyeleri ({groupMembers.length})
          </Typography>
          <IconButton onClick={() => setIsMembersDrawerOpen(false)} sx={{ color: "text.secondary" }}>
            <ArrowBackIosNewOutlined sx={{ fontSize: 18, transform: "rotate(180deg)" }} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2, borderColor: (t) => alpha(t.palette.text.secondary, 0.06) }} />

        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          {isMembersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <List disablePadding>
              {groupMembers.map((member) => (
                <Box
                  key={member.kullaniciId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    mb: 1,
                    background: (t) => alpha(t.palette.background.default, 0.3),
                    border: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.04)}`,
                  }}
                >
                  <Avatar
                    src={member.profilResmiUrl || undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      background: member.isAdmin
                        ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                        : "linear-gradient(135deg, #6366F1, #06B6D4)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {member.adSoyad.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.adSoyad}
                      </Typography>
                      {member.isAdmin && (
                        <Chip
                          label="Admin"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                            color: "#fff",
                            border: "none",
                            px: 0.5,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                      {member.rolAdi}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default ChatPage;
