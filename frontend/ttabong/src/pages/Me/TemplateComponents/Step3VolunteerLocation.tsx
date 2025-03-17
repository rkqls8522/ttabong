import { TemplateFormData, DaumPostcodeData } from "@/types/template";
import React from "react";
import { toast } from "sonner";

interface Step3Props {
  templateData: {
    locationType: string;
    address: string;
    detailAddress: string;
  };
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

const Step3VolunteerLocation: React.FC<Step3Props> = ({ templateData, setTemplateData }) => {
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data: DaumPostcodeData) {
        setTemplateData(prev => ({
          ...prev,
          address: data.address
        }));
      }
    }).open();

  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 연속된 공백 체크
    if (/\s{2,}/.test(value)) {
      toast.error('연속된 공백은 사용할 수 없습니다.');
      return;
    }

    // 30자 이하만 허용
    if (value.length <= 30) {
      setTemplateData(prev => ({
        ...prev,
        detailAddress: value
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">봉사지 입력</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`w-1/2 p-2 border rounded-md ${templateData.locationType === "주소" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setTemplateData(prev => ({ ...prev, locationType: "주소" }))}
          >
            주소 입력
          </button>
          <button
            type="button"
            className={`w-1/2 p-2 border rounded-md ${templateData.locationType === "재택" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setTemplateData(prev => ({ ...prev, locationType: "재택" }))}
          >
            재택근무
          </button>
        </div>
      </div>

      {templateData.locationType === "주소" && (
        <div className="p-4 border rounded-md bg-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">주소 검색</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              placeholder="주소를 검색하세요"
              value={templateData.address}
              readOnly
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              검색
            </button>
          </div>
          
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="상세 주소를 입력하세요 (최대 30자)"
              value={templateData.detailAddress}
              onChange={handleDetailAddressChange}
              maxLength={30}
            />
            <div className="text-sm text-gray-500 mt-1">
              {templateData.detailAddress.length}/30
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3VolunteerLocation;
