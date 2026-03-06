import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-white text-7xl font-semibold">404</h1>

      <p className="text-[#B8B8B8] mt-4 text-lg">
        The page you're looking for doesn't exist.
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-3 border border-white/20 rounded-full text-white hover:bg-white/10 transition"
      >
        Go back home
      </button>
    </div>
  );
};

export default NotFound;
