import { useState } from 'react';

const StatusCheck = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ttabong.store/api/health');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      setStatus(`✅ 서버 온라인`);
    } catch (error) {
      setStatus(`❌ 연결 실패s `);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h3>📡 백엔드 연결 상태 확인</h3>
      <button onClick={checkBackend} disabled={loading}>
        {loading ? '확인 중...' : '서버 상태 확인'}
      </button>
      <p>{status || '서버 상태를 확인하려면 버튼을 클릭하세요.'}</p>
    </div>
  );
};

export default StatusCheck;
