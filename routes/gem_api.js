// routes/gem_api.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Redis 클라이언트 (없으면 메모리 사용)
let redisClient = null;
try {
  if (process.env.REDIS_URL) {
    const Redis = require('redis');
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL,
    });
    redisClient.connect();
    console.log('✅ Redis 연결 성공 - Gemini API 캐싱 활성화');
  } else {
    console.log('⚠️  Redis 미설정 - 메모리 캐싱 사용');
  }
} catch (error) {
  console.log('⚠️  Redis 연결 실패, 메모리 저장소 사용:', error.message);
}

// 글로벌 API 제한 관리자
class GlobalAPILimiter {
  constructor(maxDailyRequests = 1000, maxPerUser = 50) {
    this.maxDailyRequests = maxDailyRequests;
    this.maxPerUser = maxPerUser;
    this.memoryStorage = new Map(); // Redis 없을 때 fallback
    this.cache = new Map(); // 응답 캐싱용
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  async getStoredData(key) {
    try {
      if (redisClient && redisClient.isOpen) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        return this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  }

  async setStoredData(key, data, expireInSeconds = null) {
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.set(key, JSON.stringify(data));
        if (expireInSeconds) {
          await redisClient.expire(key, expireInSeconds);
        }
      } else {
        this.memoryStorage.set(key, data);
        if (expireInSeconds) {
          setTimeout(
            () => this.memoryStorage.delete(key),
            expireInSeconds * 1000
          );
        }
      }
    } catch (error) {
      console.error('Storage write error:', error);
    }
  }

  async incrementCounter(key, expireInSeconds = null) {
    try {
      if (redisClient && redisClient.isOpen) {
        const count = await redisClient.incr(key);
        if (count === 1 && expireInSeconds) {
          await redisClient.expire(key, expireInSeconds);
        }
        return count;
      } else {
        const current = this.memoryStorage.get(key) || 0;
        const newCount = current + 1;
        this.memoryStorage.set(key, newCount);
        if (expireInSeconds) {
          setTimeout(
            () => this.memoryStorage.delete(key),
            expireInSeconds * 1000
          );
        }
        return newCount;
      }
    } catch (error) {
      console.error('Counter increment error:', error);
      return 1;
    }
  }

  async checkGlobalLimit(userId = null, userIP) {
    const today = this.getCurrentDate();
    const globalKey = `global_requests:${today}`;

    // 익명 사용자 처리 - IP를 기반으로 사용자 식별
    const anonymousUserKey =
      userId || `anonymous_${userIP.replace(/\./g, '_')}`;
    const userKey = `user_requests:${anonymousUserKey}:${today}`;
    const ipKey = `ip_requests:${userIP}:${today}`;

    try {
      // 전역 요청 수 확인
      const globalCount = (await this.getStoredData(globalKey)) || 0;
      if (globalCount >= this.maxDailyRequests) {
        return {
          allowed: false,
          reason: 'daily_limit_exceeded',
          remaining: 0,
          total: globalCount,
          message: `오늘의 AI 이야기 생성 한도(${this.maxDailyRequests}개)에 도달했습니다.`,
        };
      }

      // 개별 사용자/IP 요청 수 확인 (로그인 전이므로 IP 기반)
      const userCount = (await this.getStoredData(userKey)) || 0;
      const maxPerUser = userId
        ? this.maxPerUser
        : Math.min(20, this.maxPerUser); // 익명 사용자는 더 제한적

      if (userCount >= maxPerUser) {
        return {
          allowed: false,
          reason: userId ? 'user_limit_exceeded' : 'anonymous_limit_exceeded',
          remaining: this.maxDailyRequests - globalCount,
          userRemaining: 0,
          total: globalCount,
          message: userId
            ? `개인 일일 한도(${maxPerUser}개)에 도달했습니다.`
            : `익명 사용자 일일 한도(${maxPerUser}개)에 도달했습니다. 로그인하면 더 많이 이용하실 수 있어요!`,
        };
      }

      // IP별 요청 수 확인 (추가 보안 - 더 관대하게)
      const ipCount = (await this.getStoredData(ipKey)) || 0;
      const maxPerIP = Math.max(50, this.maxPerUser); // IP당 최대 50개
      if (ipCount >= maxPerIP) {
        return {
          allowed: false,
          reason: 'ip_limit_exceeded',
          remaining: this.maxDailyRequests - globalCount,
          total: globalCount,
          message: 'IP 주소당 일일 한도에 도달했습니다.',
        };
      }

      return {
        allowed: true,
        remaining: this.maxDailyRequests - globalCount - 1,
        userRemaining: maxPerUser - userCount - 1,
        total: globalCount,
        isAnonymous: !userId,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return {
        allowed: false,
        reason: 'system_error',
        message: '시스템 오류가 발생했습니다.',
      };
    }
  }

  async recordRequest(userId = null, userIP) {
    const today = this.getCurrentDate();
    const globalKey = `global_requests:${today}`;

    // 익명 사용자 처리
    const anonymousUserKey =
      userId || `anonymous_${userIP.replace(/\./g, '_')}`;
    const userKey = `user_requests:${anonymousUserKey}:${today}`;
    const ipKey = `ip_requests:${userIP}:${today}`;
    const secondsUntilMidnight = this.getSecondsUntilMidnight();

    try {
      await Promise.all([
        this.incrementCounter(globalKey, secondsUntilMidnight),
        this.incrementCounter(userKey, secondsUntilMidnight),
        this.incrementCounter(ipKey, secondsUntilMidnight),
      ]);
    } catch (error) {
      console.error('Record request error:', error);
    }
  }

  getSecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
  }

  async getStats() {
    const today = this.getCurrentDate();
    const globalKey = `global_requests:${today}`;

    try {
      const totalRequests = (await this.getStoredData(globalKey)) || 0;
      return {
        date: today,
        totalRequests,
        remaining: this.maxDailyRequests - totalRequests,
        maxDailyRequests: this.maxDailyRequests,
        cacheEnabled: redisClient ? redisClient.isOpen : false,
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        date: today,
        totalRequests: 0,
        remaining: this.maxDailyRequests,
        maxDailyRequests: this.maxDailyRequests,
        cacheEnabled: false,
      };
    }
  }

  // Redis 캐싱 메서드
  async getCachedResponse(prompt) {
    const cacheKey = `gemini_cache:${this.hashPrompt(prompt)}`;
    try {
      if (redisClient && redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
      } else {
        const cached = this.cache.get(cacheKey);
        const now = Date.now();
        if (cached && now - cached.timestamp < 10 * 60 * 1000) {
          return cached.data;
        }
        return null;
      }
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async setCachedResponse(prompt, data) {
    const cacheKey = `gemini_cache:${this.hashPrompt(prompt)}`;
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(data)); // 10분 캐시
      } else {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        // 메모리 관리: 100개 초과시 오래된 것 삭제
        if (this.cache.size > 100) {
          const oldestKey = this.cache.keys().next().value;
          this.cache.delete(oldestKey);
        }
      }
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  hashPrompt(prompt) {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}

// Gemini API 클라이언트
class GeminiAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
            candidateCount: 1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API Error: ${response.status} - ${
            errorData?.error?.message || response.statusText
          }`
        );
      }

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return {
          success: true,
          text: result.candidates[0].content.parts[0].text,
          usage: {
            promptTokens: result.usageMetadata?.promptTokenCount || 0,
            responseTokens: result.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: result.usageMetadata?.totalTokenCount || 0,
          },
        };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// 전역 인스턴스 생성
const limiter = new GlobalAPILimiter(
  parseInt(process.env.MAX_DAILY_REQUESTS) || 1000,
  parseInt(process.env.MAX_USER_REQUESTS) || 50
);

const geminiClient = new GeminiAPIClient(process.env.GEMINI_API_KEY);

// Rate Limiter 설정 (기존 서버 패턴 유지)
const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 15분에 100개 요청
  message: { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(basicRateLimit);

// 헬스체크 엔드포인트
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    redis: redisClient
      ? redisClient.isOpen
        ? 'connected'
        : 'disconnected'
      : 'not-configured',
    geminiApiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
  });
});

// 사용량 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const stats = await limiter.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: '통계를 불러오는데 실패했습니다.' });
  }
});

// 지도 이야기 생성 엔드포인트
router.post('/generate-story', async (req, res) => {
  try {
    const { userId, prompt } = req.body; // userId는 선택사항
    const userIP =
      req.ip ||
      req.connection.remoteAddress ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      'unknown';

    // 입력 검증
    if (!prompt) {
      return res.status(400).json({
        error: 'prompt가 필요합니다.',
      });
    }

    if (prompt.length > 500) {
      return res.status(400).json({
        error: '프롬프트가 너무 깁니다. (최대 500자)',
      });
    }

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API 키가 설정되지 않았습니다.',
        stats: await limiter.getStats(),
      });
    }

    const logId = userId || `익명(${userIP.substring(0, 8)}...)`;
    console.log(`📝 이야기 생성 요청: ${logId}`);

    // 캐시 확인 (Redis 우선, 메모리 fallback)
    const cachedResponse = await limiter.getCachedResponse(prompt);
    if (cachedResponse) {
      console.log(`💾 캐시 히트: ${logId}`);
      return res.json({
        ...cachedResponse,
        fromCache: true,
        stats: await limiter.getStats(),
      });
    }

    // Rate Limit 확인 (userId 없어도 OK)
    const limitCheck = await limiter.checkGlobalLimit(userId, userIP);
    if (!limitCheck.allowed) {
      console.log(`🚫 Rate limit: ${logId} - ${limitCheck.reason}`);
      return res.status(429).json({
        error: limitCheck.message,
        reason: limitCheck.reason,
        remaining: limitCheck.remaining || 0,
        isAnonymous: limitCheck.isAnonymous,
        stats: await limiter.getStats(),
      });
    }

    // Gemini API 호출
    console.log(`🤖 API 호출: ${logId}, 남은 요청: ${limitCheck.remaining}`);
    const geminiResponse = await geminiClient.generateContent(prompt);

    if (!geminiResponse.success) {
      return res.status(500).json({
        error: `AI 이야기 생성에 실패했습니다: ${geminiResponse.error}`,
        stats: await limiter.getStats(),
      });
    }

    // 요청 카운트 기록 (userId 없어도 OK)
    await limiter.recordRequest(userId, userIP);

    // 응답 데이터 준비
    const responseData = {
      text: geminiResponse.text,
      usage: geminiResponse.usage,
      fromCache: false,
      isAnonymous: !userId,
      stats: await limiter.getStats(),
    };

    // 캐싱 (Redis 우선)
    await limiter.setCachedResponse(prompt, responseData);

    console.log(`✅ 성공: ${logId}, 토큰: ${geminiResponse.usage.totalTokens}`);
    res.json(responseData);
  } catch (error) {
    console.error('Generate story error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      stats: await limiter.getStats(),
    });
  }
});

// 캐시 관리 엔드포인트 (관리자용)
router.delete('/cache/clear', async (req, res) => {
  try {
    if (redisClient && redisClient.isOpen) {
      const keys = await redisClient.keys('gemini_cache:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      res.json({ message: `${keys.length}개 캐시 항목을 삭제했습니다.` });
    } else {
      limiter.cache.clear();
      res.json({ message: '메모리 캐시를 초기화했습니다.' });
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: '캐시 초기화에 실패했습니다.' });
  }
});

// 캐시 통계 조회
router.get('/cache/stats', async (req, res) => {
  try {
    let cacheInfo = {};

    if (redisClient && redisClient.isOpen) {
      const keys = await redisClient.keys('gemini_cache:*');
      cacheInfo = {
        type: 'redis',
        size: keys.length,
        connected: redisClient.isOpen,
      };
    } else {
      cacheInfo = {
        type: 'memory',
        size: limiter.cache.size,
        connected: false,
      };
    }

    res.json(cacheInfo);
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: '캐시 통계 조회에 실패했습니다.' });
  }
});

// 테스트 엔드포인트 (개발용)
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const testPrompt = '간단한 지리 퀴즈를 하나 내주세요.';
  const testUser = 'test_user_' + Date.now();

  try {
    const result = await geminiClient.generateContent(testPrompt);
    res.json({
      test: true,
      userId: testUser,
      prompt: testPrompt,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
