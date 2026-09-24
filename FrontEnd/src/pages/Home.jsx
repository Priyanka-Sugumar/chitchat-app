import { Link } from "react-router-dom";

const Home = ({ User }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100">
      <div className="bg-white p-7 rounded-lg shadow-md w-full max-w-sm text-center">
        {User ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Hello {User.name}! Ready to Chat?
            </h2>
            <Link
              to="/chat"
              className="block w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Go to Chat
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Hello There! Ready to Chat?
            </h2>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;