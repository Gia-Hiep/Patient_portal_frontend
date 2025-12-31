import { useEffect, useState } from "react";
import { getAnnouncements } from "../api/announcementApi";
import AnnouncementItem from "../components/AnnouncementItem";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAnnouncements();
    // vì getJson trả thẳng data, không còn res.data như axios
    setAnnouncements(Array.isArray(data) ? data : []);
  };

  return (
    <div className="card">
      <h2>📢 Thông báo từ bệnh viện</h2>

      {announcements.length === 0 && <p>Không có thông báo.</p>}

      {announcements.map((item) => (
        <AnnouncementItem key={item.id} data={item} />
      ))}
    </div>
  );
}
