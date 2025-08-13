# HttpClient 사용 가이드

## 🚀 업그레이드된 axios 인스턴스

기존의 단순한 axios 인스턴스를 프로덕션급 HttpClient로 업그레이드했습니다.

### ✨ 새로운 기능들

#### 1. 기본 HTTP 메서드 (response.data 자동 추출)
```typescript
import { http } from '@/app/libs/axiosInstance'

// GET 요청
const users = await http.get<User[]>('/users')

// POST 요청  
const newUser = await http.post<User>('/users', userData)

// PUT/PATCH/DELETE
await http.put<User>(`/users/${id}`, updateData)
await http.patch<User>(`/users/${id}`, partialData)
await http.delete(`/users/${id}`)
```

#### 2. 캐싱 기능
```typescript
// 캐싱된 GET 요청 (5분간 유효)
const cachedData = await http.get<Post[]>('/posts', { cache: true })
```

#### 3. 재시도 로직
```typescript
// 실패 시 3번까지 재시도
const data = await http.get<Data>('/api/data', { retries: 3 })
```

#### 4. 파일 업로드 (진행률 포함)
```typescript
// 파일 업로드 with 진행률
await http.upload('/upload', file, (progress) => {
  console.log(`업로드 진행률: ${progress}%`)
})
```

#### 5. 요청 취소
```typescript
// 취소 가능한 요청
const { promise, cancel } = http.getWithCancel<Data>('/slow-endpoint')

// 5초 후 취소
setTimeout(() => cancel('사용자 취소'), 5000)

try {
  const data = await promise
} catch (error) {
  if (axios.isCancel(error)) {
    console.log('요청이 취소되었습니다')
  }
}
```

#### 6. 캐시 관리
```typescript
// 전체 캐시 삭제
http.cache.clear()

// 패턴별 캐시 삭제
http.cache.removeByPattern(/^GET:\/users/)

// 캐시 통계 확인
const stats = http.cache.getStats()
console.log(`캐시 항목: ${stats.size}개`)
```

### 🛡️ 자동 처리 기능들

#### 1. 인증 토큰 자동 관리
- localStorage의 `accessToken` 자동 추가
- 401 에러 시 `refreshToken`으로 자동 갱신
- 갱신 실패 시 로그인 페이지 리다이렉트

#### 2. 로딩 상태 이벤트
```typescript
// 로딩 상태 리스닝
window.addEventListener('api:loading', (event) => {
  const { isLoading } = event.detail
  // 로딩 스피너 표시/숨김
})
```

#### 3. 에러 처리
- 네트워크 에러, 타임아웃 자동 재시도
- 사용자 친화적 에러 메시지 자동 변환
- 상태 코드별 적절한 에러 메시지

### 🔧 설정 옵션

#### RequestOptions
```typescript
interface RequestOptions {
  skipErrorHandling?: boolean  // 에러 처리 스킵
  retries?: number            // 재시도 횟수
  cache?: boolean            // 캐싱 활성화
  // ... 기타 axios 옵션들
}
```

### 📊 성능 개선

| 항목 | 이전 | 현재 |
|------|------|------|
| **편의성** | 기본 | response.data 자동 추출 |
| **안정성** | 없음 | 재시도 + 에러 처리 |
| **성능** | 기본 | 캐싱 + 요청 취소 |
| **사용자 경험** | 없음 | 로딩 상태 + 진행률 |
| **보안** | 기본 | 토큰 자동 관리 |

### 🔄 마이그레이션

기존 코드 변경 최소화를 위해 레거시 지원:

```typescript
// 기존 방식 (여전히 작동)
import { axiosInstance } from '@/app/libs/axiosInstance'
const response = await axiosInstance.get('/users')
const users = response.data

// 새로운 방식 (권장)
import { http } from '@/app/libs/axiosInstance'
const users = await http.get('/users') // response.data 자동 추출
```