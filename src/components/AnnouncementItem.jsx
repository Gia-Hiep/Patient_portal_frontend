export default function AnnouncementItem({ data, onRead }) {
  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "8px",
        background: data.read ? "#1f2937" : "#0f172a",
        border: data.read ? "1px solid #374151" : "1px solid #2563eb",
      }}
    >
      <h4>
        {data.type === "EMERGENCY" ? "🚨" : "📰"} {data.title}
      </h4>

      <p>{data.content}</p>

      <small>{new Date(data.createdAt).toLocaleString()}</small>

      {!data.read && (
        <div>
          <button onClick={onRead}>Đánh dấu đã đọc</button>
        </div>
      )}
    </div>
  );
}
