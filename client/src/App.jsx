import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import logo from './assets/logo.png';
import { Home, CreatePost } from './page';

const App = () => (
  <BrowserRouter>
    <header className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]">
      {/* Link to Home page with the logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="w-24 h-auto" /> {/* Use the imported logo */}
      </Link>

      <Link
        to="/create-post"
        className="font-inter font-medium bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
        >
        Create
      </Link>

    </header>
    <main className="sm:p-8 px-4 py-8 w-full bg-[#e0f7fa] min-h-[calc(100vh-73px)]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </main>
  </BrowserRouter>
);

export default App;
