# Hướng Dẫn Triển Khai Access Token & Refresh Token

## 🔐 Tại Sao Access Token & Refresh Token Bảo Mật Hơn?

### 1. **Giảm Thiểu Rủi Ro Khi Token Bị Lộ**
- **Access Token**: Thời gian sống ngắn (15 phút - 1 giờ)
  - Nếu bị lộ, chỉ có hiệu lực trong thời gian ngắn
  - Hacker không thể sử dụng lâu dài
- **Refresh Token**: Lưu trong database, có thể revoke
  - Nếu phát hiện bị lộ, có thể thu hồi ngay lập tức
  - Có thể theo dõi và quản lý các thiết bị đăng nhập

### 2. **Kiểm Soát Tốt Hơn**
- Có thể đăng xuất tất cả thiết bị khi cần
- Theo dõi các thiết bị đang đăng nhập
- Phát hiện hoạt động đáng ngờ (nhiều thiết bị, IP khác nhau)

### 3. **Bảo Mật Tốt Hơn Cho Web**
- Web admin dùng HttpOnly cookies → JavaScript không thể truy cập
- Giảm nguy cơ XSS attack
- Refresh token tự động trong background

### 4. **Trải Nghiệm Người Dùng Tốt Hơn**
- User không cần đăng nhập lại thường xuyên
- Access token tự động refresh khi hết hạn
- Flutter app có thể lưu refresh token an toàn

---

## 📦 Cài Đặt Dependencies

```bash
npm install cookie-parser
```

---

## 🔧 Cấu Hình Environment Variables

Thêm vào file `.env`:

```env
# JWT Secrets (QUAN TRỌNG: Đổi trong production!)
JWT_SECRET=your-super-secret-access-token-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-different-from-access

# Token Expiration
JWT_EXPIRES_IN=15m          # Access token: 15 phút
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token: 7 ngày

# Cookie Settings
COOKIE_MAX_AGE=2592000000   # 30 ngày (milliseconds)
COOKIE_SECURE=false         # false cho development, true cho production
NODE_ENV=development        # development hoặc production
```

---

## 🌐 Triển Khai Cho Web Admin

### Frontend (React/Vue/Angular)

#### 1. Login
```javascript
// Login và nhận cookies tự động
const login = async (username, password) => {
  const response = await fetch('http://your-api.com/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // QUAN TRỌNG: Để gửi/nhận cookies
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  return data; // { message, user } - không có token
};
```

#### 2. Auto Refresh Token
```javascript
// Interceptor để tự động refresh token khi access token hết hạn
const apiClient = axios.create({
  baseURL: 'http://your-api.com/api',
  withCredentials: true // Để gửi cookies
});

// Request interceptor - thêm access token nếu có
apiClient.interceptors.request.use(
  (config) => {
    // Cookies tự động được gửi, không cần thêm gì
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - tự động refresh khi token hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        // Refresh access token
        await fetch('http://your-api.com/api/refresh-token', {
          method: 'POST',
          credentials: 'include' // Cookies tự động được gửi
        });

        // Retry request ban đầu
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → redirect về login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 3. Logout
```javascript
const logout = async () => {
  await fetch('http://your-api.com/api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  
  // Redirect về login
  window.location.href = '/login';
};
```

#### 4. CORS Configuration
Đảm bảo backend cho phép credentials:
```javascript
// Backend đã có sẵn:
app.use(cors({ origin: true, credentials: true }));

// Hoặc cụ thể hơn:
app.use(cors({ 
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true 
}));
```

---

## 📱 Triển Khai Cho Flutter App

### 1. Cài Đặt Dependencies

Thêm vào `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0  # Để lưu tokens an toàn
```

### 2. Tạo Auth Service

```dart
// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final String baseUrl = 'http://your-api.com/api';
  final FlutterSecureStorage _storage = FlutterSecureStorage();
  
  // Keys để lưu tokens
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user_data';

  // Login
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
        'deviceType': 'mobile'
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // Lưu tokens vào secure storage
      await _storage.write(key: _accessTokenKey, value: data['accessToken']);
      await _storage.write(key: _refreshTokenKey, value: data['refreshToken']);
      await _storage.write(key: _userKey, value: jsonEncode(data['user']));
      
      return data;
    } else {
      throw Exception('Đăng nhập thất bại: ${response.body}');
    }
  }

  // Lấy access token
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  // Lấy refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  // Refresh access token
  Future<String> refreshAccessToken() async {
    final refreshToken = await getRefreshToken();
    
    if (refreshToken == null) {
      throw Exception('Không có refresh token');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/refresh-token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final newAccessToken = data['accessToken'];
      
      // Lưu access token mới
      await _storage.write(key: _accessTokenKey, value: newAccessToken);
      
      return newAccessToken;
    } else {
      // Refresh token hết hạn → cần đăng nhập lại
      await logout();
      throw Exception('Refresh token đã hết hạn');
    }
  }

  // Logout
  Future<void> logout() async {
    final refreshToken = await getRefreshToken();
    
    if (refreshToken != null) {
      try {
        await http.post(
          Uri.parse('$baseUrl/logout'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${await getAccessToken()}'
          },
          body: jsonEncode({'refreshToken': refreshToken}),
        );
      } catch (e) {
        print('Logout error: $e');
      }
    }

    // Xóa tất cả tokens
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }

  // Kiểm tra đã đăng nhập chưa
  Future<bool> isLoggedIn() async {
    final accessToken = await getAccessToken();
    return accessToken != null;
  }
}
```

### 3. Tạo HTTP Client với Auto Refresh

```dart
// lib/services/api_client.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ApiClient {
  final AuthService _authService = AuthService();
  final String baseUrl = 'http://your-api.com/api';

  // Gửi request với auto refresh token
  Future<http.Response> request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    bool retry = true,
  }) async {
    final accessToken = await _authService.getAccessToken();
    
    final requestHeaders = {
      'Content-Type': 'application/json',
      if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      ...?headers,
    };

    final uri = Uri.parse('$baseUrl$endpoint');
    http.Response response;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(uri, headers: requestHeaders);
        break;
      case 'POST':
        response = await http.post(
          uri,
          headers: requestHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'PUT':
        response = await http.put(
          uri,
          headers: requestHeaders,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: requestHeaders);
        break;
      default:
        throw Exception('Unsupported HTTP method');
    }

    // Nếu 401 và có retry → refresh token và thử lại
    if (response.statusCode == 401 && retry) {
      try {
        // Refresh access token
        await _authService.refreshAccessToken();
        
        // Retry request với token mới
        return request(method, endpoint, body: body, headers: headers, retry: false);
      } catch (e) {
        // Refresh thất bại → throw error để UI xử lý
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }

    return response;
  }

  // Helper methods
  Future<http.Response> get(String endpoint) => request('GET', endpoint);
  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) => 
      request('POST', endpoint, body: body);
  Future<http.Response> put(String endpoint, {Map<String, dynamic>? body}) => 
      request('PUT', endpoint, body: body);
  Future<http.Response> delete(String endpoint) => request('DELETE', endpoint);
}
```

### 4. Sử Dụng Trong App

```dart
// lib/screens/login_screen.dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _authService = AuthService();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _login() async {
    try {
      await _authService.login(
        _usernameController.text,
        _passwordController.text,
      );
      
      // Navigate to home
      Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đăng nhập thất bại: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ... UI code
    );
  }
}
```

```dart
// lib/screens/home_screen.dart
import '../services/api_client.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _apiClient = ApiClient();

  Future<void> loadData() async {
    try {
      final response = await _apiClient.get('/me');
      if (response.statusCode == 200) {
        // Xử lý data
        final userData = jsonDecode(response.body);
        print('User: $userData');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ... UI code
    );
  }
}
```

---

## 🔒 Bảo Mật Bổ Sung

### 1. **Rate Limiting**
Thêm rate limiting cho các endpoint quan trọng:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5 // Tối đa 5 lần thử
});

router.post('/login', loginLimiter, authController.login);
router.post('/admin/login', loginLimiter, authController.adminLogin);
```

### 2. **HTTPS trong Production**
Luôn dùng HTTPS trong production để bảo vệ tokens.

### 3. **Token Rotation**
Có thể implement token rotation: mỗi lần refresh, tạo refresh token mới và revoke token cũ.

---

## 📝 Tóm Tắt API Endpoints

### Public Endpoints
- `POST /api/register` - Đăng ký (trả về accessToken + refreshToken)
- `POST /api/login` - Đăng nhập Flutter app (trả về accessToken + refreshToken)
- `POST /api/admin/login` - Đăng nhập Web admin (set cookies, không trả token)
- `POST /api/refresh-token` - Refresh access token

### Protected Endpoints
- `GET /api/me` - Lấy thông tin user hiện tại
- `POST /api/logout` - Đăng xuất (revoke refresh token)
- `POST /api/logout-all` - Đăng xuất tất cả thiết bị

---

## ✅ Checklist Triển Khai

- [ ] Cài đặt `cookie-parser`
- [ ] Cấu hình environment variables
- [ ] Test login web admin (cookies)
- [ ] Test login Flutter app (Bearer token)
- [ ] Test refresh token
- [ ] Test logout
- [ ] Test auto refresh khi token hết hạn
- [ ] Deploy với HTTPS trong production

