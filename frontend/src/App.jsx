import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import CreateTeacher from "./pages/CreateTeacher";
import TeacherDetails from "./pages/TeacherDetails";
import EditTeacher from "./pages/EditTeacher";
import MyNFTs from "./pages/MyNFTs";
import Login from "./pages/Login";
import SubscriptionPage from "./pages/SubscriptionPage";
import MySubscriptions from "./pages/MySubscriptionPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateTeacher />} />
          <Route path="/teacher/:id" element={<TeacherDetails />} />
          <Route path="/edit-teacher/:id" element={<EditTeacher />} />
          <Route path="/my-nfts" element={<MyNFTs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subscribe/:tokenId" element={<SubscriptionPage />} />
          <Route path="/subscription/:tokenId" element={<SubscriptionPage />} />
          <Route path="/my-subscriptions" element={<MySubscriptionPage />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;