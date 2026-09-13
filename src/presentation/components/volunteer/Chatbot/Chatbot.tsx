"use client";

import { History, RefreshCw, Send, Square, Trash2, X } from "lucide-react";
import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import ConfirmDialog from "@/presentation/components/base/ConfirmDialog/ConfirmDialog";
import Tooltip from "@/presentation/components/base/Tooltip/Tooltip";
import EmptyState from "@/presentation/components/state/EmptyState/EmptyState";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import { useChat, useBotPresence } from "@/presentation/hooks";
import {
  CHAT_ASSISTANT_NAME,
  CHAT_MAX_INPUT,
  CHAT_TEXT,
  CHAT_TIPS
} from "@/presentation/constants";
import AgentCtaModal from "./AgentCtaModal";
import BotLauncher from "./BotLauncher";
import ChatConversation from "./ChatConversation";
import ChatHeader from "./ChatHeader";
import styles from "./Chatbot.module.scss";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { showBot } = useBotPresence();

  const chat = useChat(open);

  useLayoutEffect(() => {
    const region = bottomRef.current?.parentElement;
    if (region) region.scrollTop = region.scrollHeight;
  }, [chat.messages, chat.sending]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    chat.send(input);
    setInput("");
  }

  function startNewChat() {
    chat.stop();
    chat.newChat();
    setHistoryOpen(false);
    setInput("");
  }

  function confirmDelete() {
    if (deleteId) chat.deleteChat(deleteId);
    setDeleteId(null);
  }

  return (
    <>
      {!open && showBot && <BotLauncher thinking={chat.sending} onOpen={() => setOpen(true)} />}

      <div className={styles.root} dir="rtl">
      {open && (
        <section className={styles.window} role="dialog" aria-label={CHAT_ASSISTANT_NAME}>
          <ChatHeader
            remaining={chat.remaining}
            limit={chat.limit}
            models={chat.models}
            preferredModel={chat.preferredModel}
            historyOpen={historyOpen}
            onModelChange={chat.setPreferredModel}
            onOpenAgent={() => setAgentOpen(true)}
            onToggleHistory={() => setHistoryOpen((value) => !value)}
            onNewChat={startNewChat}
            onMinimize={() => setOpen(false)}
          />

          {historyOpen ? (
            <div className={styles.messages}>
              <div className={styles.historyHead}>
                <strong>{CHAT_TEXT.historyTitle}</strong>
                <small>{CHAT_TEXT.historyNote}</small>
              </div>
              {chat.metaLoading ? (
                <div className={styles.panelState}>
                  <LoadingState compact text={CHAT_TEXT.historyLoading} />
                </div>
              ) : !chat.chats.length ? (
                <div className={styles.panelState}>
                  <EmptyState
                    icon={History}
                    title={CHAT_TEXT.historyEmptyTitle}
                    message={CHAT_TEXT.historyEmpty}
                  />
                </div>
              ) : (
                <div className={styles.historyList}>
                  {chat.chats.map((conversation) => (
                    <div className={styles.historyRow} key={conversation.id}>
                      <button
                        type="button"
                        disabled={chat.sending}
                        className={`${styles.historyOpen} ${conversation.id === chat.activeId ? styles.historyOn : ""}`}
                        onClick={() => {
                          chat.selectChat(conversation.id);
                          setHistoryOpen(false);
                        }}
                      >
                        <span>{conversation.title}</span>
                        <small>{conversation.messages.length} رسالة</small>
                      </button>
                      <Tooltip content={CHAT_TIPS.delete}>
                        <button
                          type="button"
                          className={styles.historyDelete}
                          disabled={chat.sending}
                          aria-label={CHAT_TIPS.delete}
                          onClick={() => setDeleteId(conversation.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ChatConversation
              messages={chat.messages}
              pendingId={chat.pendingId}
              sending={chat.sending}
              outOfQuota={chat.outOfQuota}
              onSend={chat.send}
              bottomRef={bottomRef}
            />
          )}

          <form className={styles.composer} onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={chat.outOfQuota ? CHAT_TEXT.placeholderBlocked : CHAT_TEXT.placeholder}
              disabled={chat.sending || historyOpen || chat.outOfQuota}
              dir={input ? "auto" : "rtl"}
              maxLength={CHAT_MAX_INPUT}
              aria-label={CHAT_TEXT.placeholder}
              enterKeyHint="send"
            />
            {chat.canRegenerate && !chat.sending && (
              <Tooltip content={CHAT_TIPS.regenerate}>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={chat.regenerate}
                  aria-label={CHAT_TIPS.regenerate}
                >
                  <RefreshCw size={15} />
                </button>
              </Tooltip>
            )}
            {chat.sending ? (
              <Tooltip content={CHAT_TIPS.stop}>
                <button
                  type="button"
                  className={styles.stopBtn}
                  onClick={chat.stop}
                  aria-label={CHAT_TIPS.stop}
                >
                  <Square size={14} />
                </button>
              </Tooltip>
            ) : (
              <Tooltip content={CHAT_TIPS.send}>
                <button
                  type="submit"
                  disabled={!input.trim() || historyOpen || chat.outOfQuota}
                  aria-label={CHAT_TIPS.send}
                >
                  <Send size={17} />
                </button>
              </Tooltip>
            )}
          </form>
        </section>
      )}

      {open && (
        <button
          className={styles.closeLauncher}
          type="button"
          onClick={() => setOpen(false)}
          aria-label={CHAT_TIPS.close}
          aria-expanded={true}
        >
          <X size={18} />
        </button>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={CHAT_TEXT.deleteTitle}
        message={CHAT_TEXT.deleteMessage}
        confirmText={CHAT_TEXT.deleteConfirm}
        cancelText={CHAT_TEXT.cancel}
        variant="danger"
      />

      <AgentCtaModal open={agentOpen} onClose={() => setAgentOpen(false)} />
    </div>
    </>
  );
}
