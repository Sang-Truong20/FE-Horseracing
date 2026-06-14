import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/router";
import { Provider, useDispatch } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AOS from "aos";
import "aos/dist/aos.css";
import { StateProvider } from "./Context/StateProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import api from "./config/axios";
import { loginSuccess, logout } from "./redux/features/userSlice";
const queryClient = new QueryClient();
AOS.init({
  duration: 1000,
});

const AuthLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    if (!token) return;

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/api/auth/me");
        if (response.data?.status === "Success" && response.data?.data) {
          dispatch(loginSuccess({ user: response.data.data, token }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng từ auth/me:", error);
        dispatch(logout());
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return null;
};

function App() {
  // useRealtime((data) => {
  //   console.log(data);
  // });
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StateProvider>
              <AuthLoader />
              <RouterProvider router={router} />
            </StateProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
