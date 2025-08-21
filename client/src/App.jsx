import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BackgroundProvider } from '@/context/BackgroundContext';
import { UserProvider } from '@/context/UserContext';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import VideoGallery from '@/pages/VideoGallery';
import SuccessStories from '@/pages/SuccessStories';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import UserLogin from '@/pages/UserLogin';
import UserRegister from '@/pages/UserRegister';
import UserProfile from '@/pages/UserProfile';
import Cart from '@/pages/Cart';
import AdminLogin from '@/pages/AdminLogin';
import Dashboard from '@/pages/admin/Dashboard';
import CategoryManager from '@/pages/admin/CategoryManager';
import SubcategoryManager from '@/pages/admin/SubcategoryManager';
import MachineManager from '@/pages/admin/MachineManager';
import VideoManager from '@/pages/admin/VideoManager';
import PartnerManager from '@/pages/admin/PartnerManager';
import SuccessStoryManager from '@/pages/admin/SuccessStoryManager';
import UserFeedbackManager from '@/pages/admin/UserFeedbackManager';
import UserSuccessStoryManager from '@/pages/admin/UserSuccessStoryManager';
import AboutManager from '@/pages/admin/AboutManager';
import ContactManager from '@/pages/admin/ContactManager';
import SettingsManager from '@/pages/admin/SettingsManager';
import SubscriptionManager from '@/pages/admin/SubscriptionManager';
import RequireAdminAuth from '@/routes/AdminRoutes';

export default function App() {
  return (
    <BackgroundProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/videos" element={<VideoGallery />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin (Protected) */}
            <Route path="/admin" element={<RequireAdminAuth />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="subcategories" element={<SubcategoryManager />} />
              <Route path="machines" element={<MachineManager />} />
              <Route path="videos" element={<VideoManager />} />
              <Route path="partners" element={<PartnerManager />} />
              <Route path="success-stories" element={<SuccessStoryManager />} />
              <Route path="user-feedback" element={<UserFeedbackManager />} />
              <Route path="user-success-stories" element={<UserSuccessStoryManager />} />
              <Route path="about" element={<AboutManager />} />
              <Route path="contacts" element={<ContactManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="subscriptions" element={<SubscriptionManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </BackgroundProvider>
  );
}
