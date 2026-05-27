import { createSlice } from "@reduxjs/toolkit";

// Hàm bổ trợ để lấy dữ liệu an toàn từ localStorage
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState = {
  // Đảm bảo khởi tạo là một OBJECT, không được để null ở cấp cao nhất
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      const nextState = {
        ...state,
        user: user || null,
        token: token || null,
        isAuthenticated: !!token,
      };

      // Lưu vào localStorage để duy trì đăng nhập
      localStorage.setItem("user", JSON.stringify(nextState.user));
      localStorage.setItem("token", nextState.token || "");

      return nextState;
    },
    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;