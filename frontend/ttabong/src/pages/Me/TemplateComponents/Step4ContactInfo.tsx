import { TemplateFormData } from "@/types/template";
import React from "react";
import { toast } from "sonner";

interface Step4Props {
  templateData: {
    contactName: string;
    contactPhone: {
      areaCode: string;
      middle: string;
      last: string;
    };
  };
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
}


const Step4ContactInfo: React.FC<Step4Props> = ({ templateData, setTemplateData }) => {
  const areaCodes = ["02", "031", "032", "041", "042", "043", "051", "052", "053", "054", "055", "061", "062", "063", "064", "070", "010"];

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'middle' | 'last') => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setTemplateData(prev => ({
      ...prev,
      contactPhone: {
        ...prev.contactPhone,
        [field]: value
      }
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 한글만 허용 (자음, 모음 포함)
    if (!/^[ㄱ-ㅎㅏ-ㅣ가-힣]*$/.test(value)) {
      toast.error('한글만 입력 가능합니다.');
      return;
    }

    // 공백 체크
    if (/\s/.test(value)) {
      toast.error('공백은 사용할 수 없습니다.');
      return;
    }

    // 5자 이하만 허용
    if (value.length <= 5) {
      setTemplateData(prev => ({
        ...prev,
        contactName: value
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="홍길동 (한글 5자 이내)"
          value={templateData.contactName}
          onChange={handleNameChange}
          maxLength={5}
        />
        <div className="text-sm text-gray-500 mt-1">
          {templateData.contactName.length}/5
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">담당자 연락처</label>
        <div className="flex gap-2">
          <select
            className="w-1/4 p-2 border rounded-md"
            value={templateData.contactPhone.areaCode}
            onChange={(e) => setTemplateData(prev => ({
              ...prev,
              contactPhone: {
                ...prev.contactPhone,
                areaCode: e.target.value
              }
            }))}
          >
            {areaCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>

          <input
            type="text"
            className="w-1/4 p-2 border rounded-md text-center"
            placeholder="XXXX"
            value={templateData.contactPhone.middle}
            onChange={(e) => handleNumberInput(e, 'middle')}
          />

          <input
            type="text"
            className="w-1/4 p-2 border rounded-md text-center"
            placeholder="XXXX"
            value={templateData.contactPhone.last}
            onChange={(e) => handleNumberInput(e, 'last')}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4ContactInfo;
