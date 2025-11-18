import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  delay?: number;
}

const ChatMessage = ({ message, isUser, delay = 0 }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-chat-user" : "bg-chat-bot border border-border"
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-chat-user-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-chat-bot-foreground" />
        )}
      </div>
      <div className={`max-w-[70%] p-3 rounded-2xl ${
        isUser 
          ? "bg-chat-user text-chat-user-foreground rounded-tr-sm" 
          : "bg-chat-bot text-chat-bot-foreground border border-border rounded-tl-sm"
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
