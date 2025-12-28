import { useEffect, useState } from "react";
import { getAnnouncements, markAsRead } from "../api/announcementApi";
import AnnouncementItem from "../components/AnnouncementItem";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAnnouncements();
    setAnnouncements(Array.isArray(data) ? data : []);
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    loadData();
  };

  return (
    <div className="card">
      <h2>📢 Thông báo từ bệnh viện</h2>

      {announcements.length === 0 && <p>Không có thông báo.</p>}

      {announcements.map((item) => (
        <AnnouncementItem
          key={item.id}
          data={item}
          onRead={() => handleRead(item.id)}
        />
      ))}
    </div>
  );
}
