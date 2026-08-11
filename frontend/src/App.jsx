import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import CreateTeacher from "./pages/CreateTeacher";
import TeacherDetails from "./pages/TeacherDetails";
import EditTeacher from "./pages/EditTeacher";
import MyNFTs from "./pages/MyNFTs";
import Login from "./pages/Login";
import SubscriptionPage from "./pages/SubscriptionPage";
import MySubscriptionPage from "./pages/MySubscriptionPage";
import MyRentalsPage from "./pages/MyRentalsPage";
import CountrySelector from "./pages/CountrySelector";
import SubjectPage from "./pages/SubjectPage";
import TopicPage from "./pages/TopicPage";
import Statistics from "./pages/Statistics";

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
          <Route path="/my-rentals" element={<MyRentalsPage />} />
          <Route path="/country" element={<CountrySelector />} />
          <Route path="/subject/:subject" element={<SubjectPage/>} />
          <Route path="/subject/:subject/topic/:topic" element={<TopicPage/>} />
          <Route path="/statistics" element={<Statistics />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;