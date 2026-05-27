import { RouterProvider } from "react-router-dom";
import { router } from "./config/router";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AOS from "aos";
import "aos/dist/aos.css";
import { StateProvider } from "./Context/StateProvider";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
AOS.init({
  duration: 1000,
});
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
              <RouterProvider router={router} />
            </StateProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
