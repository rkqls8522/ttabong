import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { StepProps } from '@/types/template';
import { CalendarIcon } from "lucide-react";
import { useTemplateStore } from '@/stores/templateStore';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";

const Step0GroupSelection: React.FC<StepProps> = ({ templateData, setTemplateData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const { groups, fetchTemplates, createGroup } = useTemplateStore();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      const newGroup = await createGroup(newGroupName.trim());
      // 새로 생성된 그룹 자동 선택
      setTemplateData(prev => ({
        ...prev,
        groupId: newGroup.groupId
      }));
      setNewGroupName("");
      setShowDialog(false);
    }
  };

  // 그룹명 입력 핸들러
  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 특수문자 체크
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      toast.error('특수문자는 사용할 수 없습니다.');
      return;
    }

    // 20자 이하만 허용
    if (value.length <= 20) {
      setNewGroupName(value);
    }
  };

  // 그룹 추가 핸들러
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('그룹명을 입력해주세요.');
      return;
    }

    handleCreateGroup();
  };

  // 봉사 분야 목록
  const volunteerFields = [
    "교육",
    "문화예술",
    "환경",
    "사회복지",
    "보건의료",
    "농어촌",
    "기타"
  ];

  // 봉사 분야 토글 함수를 선택 함수로 변경
  const selectField = (field: string) => {
    setTemplateData(prev => ({
      ...prev,
      volunteerField: [field]  // 배열이지만 항상 하나의 값만 포함
    }));
  };

  // 오늘 날짜 생성
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

  // 다이얼로그 열기 핸들러 수정
  const openDialog = () => {
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">공고 그룹 선택</Label>
        <Select
          value={templateData.groupId?.toString()}
          onValueChange={(value) => 
            setTemplateData({ ...templateData, groupId: parseInt(value) })
          }
        >
          <SelectTrigger className="mt-3">
            <SelectValue placeholder="공고 그룹을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {groups && groups.length > 0 ? (
              groups.map((group) => (
                <SelectItem
                  key={group.groupId}
                  value={group.groupId.toString()}
                >
                  {group.groupName}
                </SelectItem>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                아직 그룹이 없습니다. 그룹을 추가해주세요.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 🔹 그룹 추가 버튼 */}
      <Button className="mt-2" onClick={openDialog}>
        그룹 추가
      </Button>

      {/* 🔹 그룹 추가 다이얼로그 */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          setNewGroupName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 그룹 추가</DialogTitle>
          </DialogHeader>
          <Input
            value={newGroupName}
            onChange={handleGroupNameChange}
            placeholder="그룹명 입력 (최대 20자, 특수문자 제외)"
            maxLength={20}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newGroupName.trim()) {
                e.preventDefault();
                handleAddGroup();
              }
            }}
          />
          <DialogFooter>
            <Button onClick={handleAddGroup}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔹 모집 기간 선택 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">모집 기간</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <DatePicker
              selected={templateData.startDate}
              onChange={(date) => setTemplateData((prev) => ({
                ...prev,
                startDate: date,
                endDate: null,
                volunteerDate: null
              }))}
              placeholderText="시작일 선택"
              className="w-full p-2 pl-10 border rounded-md"
              minDate={today}
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <span className="self-center">~</span>

          <div className="relative flex-1">
            <DatePicker
              selected={templateData.endDate}
              onChange={(date) => setTemplateData((prev) => ({
                ...prev,
                endDate: date,
                volunteerDate: null
              }))}
              placeholderText="종료일 선택"
              className="w-full p-2 pl-10 border rounded-md"
              minDate={templateData.startDate || today}
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 🔹 봉사일 선택 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">봉사일</label>
        <div className="relative">
          <DatePicker
            selected={templateData.volunteerDate}
            onChange={(date) => setTemplateData((prev) => ({ ...prev, volunteerDate: date }))}
            placeholderText="봉사일 선택"
            className="w-full p-2 pl-10 border rounded-md"
            minDate={templateData.endDate || today}
            locale={ko}
            dateFormat="yyyy년 MM월 dd일"
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 🔹 봉사 시간 선택 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">봉사 시간</label>
        <div className="flex gap-2">
          <input
            type="time"
            className="w-1/2 p-2 border rounded-md"
            value={templateData.startTime}
            onChange={(e) => setTemplateData((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <span className="self-center">~</span>


          <input
            type="time"
            className="w-1/2 p-2 border rounded-md"
            value={templateData.endTime}
            onChange={(e) => setTemplateData((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </div>


      </div>

      {/* 봉사 분야 선택 UI */}
      <div>
        <Label className="text-base">봉사 분야 선택</Label>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {volunteerFields.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => selectField(field)}
              className={`p-2 rounded-md border ${
                templateData.volunteerField[0] === field  // 첫 번째(유일한) 값과 비교
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step0GroupSelection;
