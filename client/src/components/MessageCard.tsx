import type { FC } from "react";

export type Message = {
  id: string;
  sender: string;
  text: string;
  direction: "inbound" | "outbound";
  time: string;
};

type MessageCardProps = {
  message: Message;
};

const MessageCard: FC<MessageCardProps> = ({ message }) => {
  const isInbound = message.direction === "inbound";
  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/8 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-body/70">
        <span className="font-semibold text-heading">{message.sender}</span>
        <span>{message.time}</span>
      </div>
      <div className={`text-sm ${isInbound ? "text-body" : "text-primary"}`}>{message.text}</div>
      <div className="text-[11px] text-body/60">{isInbound ? "Inbound" : "Outbound"}</div>
    </div>
  );
}

export default MessageCard;
