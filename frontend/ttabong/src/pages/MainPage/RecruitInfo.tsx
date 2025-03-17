import React from "react";
import { MapPin, Phone, Clock, Users, Globe } from "lucide-react";

const RecruitInfo: React.FC = () => {

  // 임의의 봉사 공고 데이터
  const post = {
    title: "매장 운영 지원",
    subtitle: "아름다운가게 부산사상점",
    location: "부산광역시 사상구",
    distance: "내 위치에서 40km",
    status: "모집 중",
    tags: ["#인기 봉사활동", "#우수한 후기"],
    categories: ["정기봉사", "협동심", "이타적인", "사회적기업", "유연함"],
    description: "아름다운가게에 오시는 당신이 아름답습니다.",
    contact: "010-6469-7498",
    institution: "1577-1577",
    deadline: "D-100",
    applicants: "10/25 명 지원",
    website: "https://www.beautifulstore.org",
    image: "https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/749/ad58fe995cb9198412288b21bc63e1c9_res.jpeg",
    gallery: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi60jIONayZwxiEFWQ0m9D-KHD_jM4lCJ52A&s",
      "https://i.namu.wiki/i/-yJWbNXB_78Cj8yuGFzU4gk1x9-L8CIeHdKQVuQB4JYJ3j33x6Pkigv6tf40dwDSg6RaAzsuEZW96M-P0TTKKg.webp",
    ],
  };

  return (
    <div className="bg-blue-200 min-h-screen flex justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
        {/* 메인 이미지 */}
        <img src={post.image} alt="봉사 활동" className="w-full h-48 object-cover rounded-lg" />

        {/* 제목 및 위치 정보 */}
        <div className="mt-4">
          <h1 className="text-xl font-bold">{post.title}</h1>
          <p className="text-gray-600">{post.subtitle}</p>
          <div className="flex items-center text-gray-500 mt-1">
            <MapPin size={16} className="text-red-500" />
            <span>{post.location} • {post.distance}</span>
          </div>
        </div>

        {/* 모집 상태 및 태그 */}
        <div className="mt-3">
          <span className="bg-yellow-400 text-white text-xs px-3 py-1 rounded-full font-semibold">
            {post.status}
          </span>
          <div className="mt-2 flex gap-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-blue-500 font-semibold text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 카테고리 */}
        <div className="mt-3 bg-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2">
          {post.categories.join(" / ")}
        </div>

        {/* 소개 */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">소개</h3>
          <p className="text-gray-600 mt-1">{post.description}</p>
        </div>

        {/* 추가 이미지 갤러리 */}
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto">
            {post.gallery.map((img, index) => (
              <img key={index} src={img} alt="갤러리" className="w-28 h-20 object-cover rounded-lg" />
            ))}
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center text-gray-700">
            <Phone size={16} className="text-gray-500" />
            <span>담당자: {post.contact}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Phone size={16} className="text-gray-500" />
            <span>기관: {post.institution}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock size={16} className="text-gray-500" />
            <span>모집 마감까지 {post.deadline}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Users size={16} className="text-gray-500" />
            <span>현재까지 {post.applicants}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Globe size={16} className="text-gray-500" />
            <a href={post.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              공식 홈페이지
            </a>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default RecruitInfo;
