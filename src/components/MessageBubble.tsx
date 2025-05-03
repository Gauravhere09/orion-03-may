
import { cn } from "@/lib/utils";
import { Message } from "@/services/api";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-slide-in",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none ml-4" 
          : "bg-secondary text-secondary-foreground rounded-tl-none mr-4"
      )}>
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line || " "}
          </p>
        ))}
      </div>
    </div>
  );
};

export default MessageBubble;
