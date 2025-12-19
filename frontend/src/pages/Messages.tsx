import MessageCard from "@/components/MessageCard";

const messages = [
  { id: "m1", sender: "User X", text: "Hello?", direction: "inbound" as const, time: "09:30" },
  { id: "m2", sender: "Bot", text: "Hi, what's up?", direction: "outbound" as const, time: "09:31" }
];

function Messages() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">Messenger</div>
      <p className="text-body text-sm">Live threads and AI replies.</p>
      <div className="grid gap-3">
        {messages.map((m) => (
          <MessageCard key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}

export default Messages;
