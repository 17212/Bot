import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostScheduler from "./pages/PostScheduler";
import Comments from "./pages/Comments";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import About from "./pages/About";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/scheduler" element={<PostScheduler />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
