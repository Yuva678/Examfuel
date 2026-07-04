import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TargetCursor from './components/TargetCursor';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Resources = lazy(() => import('./pages/Resources'));
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'));
const SmartStuff = lazy(() => import('./pages/SmartStuff'));
const Semester = lazy(() => import('./pages/Semester'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Upload = lazy(() => import('./pages/Upload'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <TargetCursor 
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          cursorColor="#a78bfa"
          cursorColorOnTarget="#B497CF"
        />
        <Layout>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 min-h-screen"><div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
              <Route path="/smart-stuff" element={<ProtectedRoute><SmartStuff /></ProtectedRoute>} />
              <Route path="/semester" element={<ProtectedRoute><Semester /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Protected Routes — require authentication */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

