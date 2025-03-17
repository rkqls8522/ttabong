import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TemplateFormData } from "@/types/template";

interface Step2Props {
  templateData: {
    volunteerTypes: string[];
    volunteerCount: number;
  };
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
}


const Step2RecruitmentConditions: React.FC<Step2Props> = ({ templateData, setTemplateData }) => {
  const toggleType = (type: string) => {
    setTemplateData(prev => ({
      ...prev,
      volunteerTypes: prev.volunteerTypes.includes(type)
        ? prev.volunteerTypes.filter(t => t !== type)
        : [...prev.volunteerTypes, type]
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">봉사자 유형</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`w-1/2 p-2 border rounded-md ${templateData.volunteerTypes.includes("성인") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => toggleType("성인")}
          >
            성인
          </button>
          <button
            type="button"
            className={`w-1/2 p-2 border rounded-md ${templateData.volunteerTypes.includes("청소년") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => toggleType("청소년")}
          >
            청소년
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">* 다중선택 가능</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원</label>
        <Select
          value={templateData.volunteerCount.toString()}
          onValueChange={(value) => setTemplateData(prev => ({
            ...prev,
            volunteerCount: parseInt(value)
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="인원 선택" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 100 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} 명</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">* 최소 1명, 최대 100명</p>
      </div>
    </div>
  );
};

export default Step2RecruitmentConditions;
