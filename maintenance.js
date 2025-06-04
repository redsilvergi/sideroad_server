const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files if needed
app.use(express.static('public'));

// HTML maintenance page
const maintenanceHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>서버 점검 중</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0062af 0%, #004080 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 8px 32px rgba(0, 98, 175, 0.2);
            max-width: 500px;
            width: 90%;
            color: #0062af;
        }
        
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 300;
            color: #0062af;
        }
        
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.8;
            line-height: 1.6;
            color: #004080;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(0, 98, 175, 0.2);
            border-top: 4px solid #0062af;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .status {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 1rem;
            color: #004080;
        }
        
        .estimated-time {
            background: rgba(0, 98, 175, 0.1);
            padding: 1rem;
            border-radius: 10px;
            margin-top: 1rem;
            border: 1px solid rgba(0, 98, 175, 0.2);
            color: #0062af;
        }
        
        @media (max-width: 480px) {
            h1 { font-size: 2rem; }
            p { font-size: 1rem; }
            .container { padding: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>서버 점검 중</h1>
        <p>더 나은 서비스 제공을 위해<br>시스템 점검을 진행하고 있습니다.</p>
        
        <div class="spinner"></div>
        
        <div class="estimated-time">
            <strong>점검 진행 시간</strong><br>
            <span id="elapsed-time">계산 중...</span>
        </div>
        
        <div class="status">
            잠시만 기다려 주세요...
        </div>
    </div>
    
    <script>
        // 점검 시작 시간 (서버 시작 시간)
        const maintenanceStartTime = ${Date.now()};
        
        function updateElapsedTime() {
            const now = Date.now();
            const elapsed = now - maintenanceStartTime;
            
            const minutes = Math.floor(elapsed / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            
            const elapsedElement = document.getElementById('elapsed-time');
            if (minutes > 0) {
                elapsedElement.textContent = minutes + '분 ' + seconds + '초';
            } else {
                elapsedElement.textContent = seconds + '초';
            }
        }
        
        // 1초마다 시간 업데이트
        updateElapsedTime(); // 즉시 실행
        setInterval(updateElapsedTime, 1000);
        
        // Auto refresh every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>
`;

// Maintenance start time
const MAINTENANCE_START_TIME = Date.now();

// Handle all routes
app.use('*', (req, res) => {
  // Calculate elapsed time
  const elapsed = Date.now() - MAINTENANCE_START_TIME;
  const elapsedMinutes = Math.floor(elapsed / (1000 * 60));
  const elapsedSeconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  // Check if request accepts HTML
  if (req.accepts('html')) {
    res
      .status(503)
      .send(maintenanceHTML.replace('${Date.now()}', MAINTENANCE_START_TIME));
  } else {
    // For API requests, return JSON
    res.status(503).json({
      message: '서버 점검 중',
      status: 'maintenance',
      maintenanceStartTime: new Date(MAINTENANCE_START_TIME).toISOString(),
      elapsedTime: `${elapsedMinutes}분 ${elapsedSeconds}초`,
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔧 Maintenance server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the maintenance page`);
});
