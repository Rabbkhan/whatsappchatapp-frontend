import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  setOnlineUser,
  setSocketConnection,
  setUser,
  logout,
} from "../redux/userSlice";
import Logo from "../assets/logo.png";
import { io } from "socket.io-client";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import MessagePage from "../components/MessagePage";

const Home = () => {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUserAndFetchDetails = async () => {
      const token = localStorage.getItem("token");
      console.log("Token:", token, "User:", user);
      if (!user || !token) {
        console.log("Redirecting: no user or token");
        navigate("/email");
      } else {
        await fetchUserDetails();
      }
    };
    checkUserAndFetchDetails();
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/user-details`;
      console.log("Fetching from:", URL);
      const response = await axios.get(URL, { withCredentials: true });
      console.log("Response:", response.data);
      dispatch(setUser(response.data.data));
      if (response.data.data.logout) {
        console.log("Logout flag detected");
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized, redirecting");
        dispatch(logout());
        navigate("/email");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.log("No token found, redirecting to /email");
      navigate("/email");
      return;
    }

    const socketConnection = io(import.meta.env.VITE_APP_BACKEND_URL, {
      auth: { token },
    });

    socketConnection.on("connect", () => {
      console.log("WebSocket connected");
    });

    socketConnection.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socketConnection.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    socketConnection.on("onlineUser", (data) => {
      // console.log("Online user data:", data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch, navigate]);

  const basePath = location.pathname === "/";

  return (
    <>
      <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
        <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
          <Sidebar />
        </section>

        <section className={`${basePath && "hidden"}`}>
          <MessagePage />
        </section>

        <div
          className={`justify-center items-center flex-col gap-2 hidden ${
            !basePath ? "hidden" : "lg:flex"
          }`}
        >
          <div>
            <img src={Logo} width={200} alt="logo" />
          </div>
          <div>
            <p className="text-2xl">Select user to send message</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
