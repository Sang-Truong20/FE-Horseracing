# Admin Page Documentation

## Tổng Quan
Admin Page được xây dựng với login check và role-based access control. Chỉ người dùng có role "Admin" mới có thể truy cập `/admin`.

## Cấu Trúc Thư Mục

```
src/
├── layout/
│   └── AdminLayout.jsx          # Layout chính cho admin (sidebar + main content)
├── pages/
│   └── Admin/
│       ├── AdminDashboard.jsx   # Trang chủ admin
│       ├── AdminUsers.jsx       # Quản lý người dùng
│       ├── AdminOwners.jsx      # Quản lý chủ ngựa
│       └── AdminJockeys.jsx     # Quản lý jockey
└── component/
    └── admin/
        ├── Statistics.jsx       # Hiển thị các thống kê
        ├── UserList.jsx         # Bảng danh sách người dùng
        └── JockeyApproval.jsx   # Danh sách jockey chờ duyệt
```

## Features

### 1. **Admin Layout** (`AdminLayout.jsx`)
- Sidebar navigation với các menu chính
- User profile & logout button
- Responsive design với Tailwind CSS

### 2. **Admin Dashboard** (`AdminDashboard.jsx`)
- Hiển thị thống kê tổng quan (total users, owners, jockeys, withdraw requests)
- Danh sách người dùng với phân trang
- Widget duyệt jockey chờ xử lý

### 3. **Components**

#### Statistics Component
- Hiển thị 4 card thống kê chính
- Icon từ lucide-react
- Responsive grid layout

#### UserList Component
- Bảng danh sách người dùng
- Filter theo role, status
- Action buttons (view, edit, delete)
- Phân trang

#### JockeyApproval Component
- Danh sách jockey chờ duyệt
- Search functionality
- Approve/Reject buttons

## Login Check & Role Protection

### Cách Hoạt Động:
1. User login qua `/login`
2. Backend trả về user object với `role` field
3. User data được lưu trong Redux store
4. Router component `ProtectedRoute` kiểm tra:
   - `isAuthenticated` - có token không?
   - `user.role === "Admin"` - role có phải Admin không?
5. Nếu không match → redirect về `/login`

### Code:
```javascript
const ProtectedRoute = ({ allowRole }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== allowRole) return <Navigate to="/login" replace />;
  return <Outlet />;
};
```

## Routes

| Path | Component | Role Required |
|------|-----------|---------------|
| `/admin` | AdminDashboard | Admin |
| `/admin/users` | AdminUsers | Admin |
| `/admin/owners` | AdminOwners | Admin |
| `/admin/jockeys` | AdminJockeys | Admin |

## Logout

- Nút logout ở bottom left sidebar
- Gọi Redux `logout` action
- Xóa user & token từ localStorage
- Redirect về `/login`

## Styling

- Tailwind CSS với dark theme
- Color scheme: Purple/Gray (#6366f1, #374151)
- Icons từ `lucide-react`
- Responsive trên mobile, tablet, desktop

## Mở Rộng

Để thêm tính năng mới:

1. Tạo component mới trong `src/component/admin/`
2. Tạo page mới trong `src/pages/Admin/`
3. Import vào `AdminLayout.jsx`
4. Thêm route vào `config/router.jsx`
5. Thêm navigation link vào sidebar trong `AdminLayout.jsx`

## API Integration

Components hiện đang sử dụng mock data. Để kết nối API:

1. Tạo API calls trong hooks (useCallApi.js)
2. Fetch data trong useEffect của component
3. Update component state hoặc Redux store
4. Render dữ liệu thực từ backend
