import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axiosInstance from "../api/axiosInstance"; 

const RecruitFind: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [region, setRegion] = useState<string>("서울"); 
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/volunteer/recruits", {
        templateTitle: searchQuery || null,
        searchConditions: {
          organizationName: null,
          status: status,
          activityDate: {
            start: "2025-02-20",
            end: "2025-02-28",
          },
          region: region,
        },
      });

      setPosts(response.data.templates || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  };


  const handleSearch = () => {
    fetchPosts();
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-blue-200 min-h-screen flex justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="mr-2">TTABONG</span> 🤟
          </h1>
          <Bell size={20} className="text-gray-500" />
        </div>

        {/* 검색창 */}
        <div className="mt-3 relative flex gap-2">
          <input
            type="text"
            placeholder="검색할 제목 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="서울">서울</option>
            <option value="부산">부산</option>
            <option value="대구">대구</option>
            <option value="광주">광주</option>
          </select>
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value || null)}
            className="border p-2 rounded-lg"
          >
            <option value="">전체</option>
            <option value="RECRUITING">모집 중</option>
            <option value="RECRUITMENT_CLOSED">모집 마감</option>
            <option value="ACTIVITY_COMPLETED">활동 완료</option>
          </select>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg"
          >
            검색
          </button>
        </div>

        {/* 봉사 공고 리스트 */}
        <div className="mt-4">
          {loading ? (
            <p className="text-center">🔄 로딩 중...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.templateId} className="bg-white shadow rounded-lg overflow-hidden mb-3">
                <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <h2 className="text-lg font-bold">{post.title}</h2>
                  <p className="text-gray-500 text-sm">{post.activityLocation}</p>
                  <p className="text-gray-600 text-sm">📍 {post.region}</p>
                  <p className="text-gray-600 text-sm">상태: {post.status}</p>
                  <p className="text-gray-600 text-sm">
                    📅 {post.recruits.length > 0 ? post.recruits[0].activityDate : "일정 미정"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitFind;
