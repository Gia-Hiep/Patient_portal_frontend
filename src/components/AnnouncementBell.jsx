import { useEffect, useState } from "react";
import { getUnreadCount } from "../api/announcementApi";
import { useNavigate } from "react-router-dom";

export default function AnnouncementBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    const res = await getUnreadCount();
    setCount(res.data);
  };

  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => navigate("/announcements")}
    >
      🔔
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "12px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
