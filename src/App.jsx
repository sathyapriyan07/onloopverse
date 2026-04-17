import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetail } from './pages/MovieDetail';
import { PersonDetail } from './pages/PersonDetail';
import { Search } from './pages/Search';
import { Discover } from './pages/Discover';
import { Login } from './pages/Login';
import { AdminDashboardPage } from './pages/admin/Dashboard';
import { AdminMoviesPage } from './pages/admin/Movies';
import { AdminPeoplePage } from './pages/admin/People';
import { AdminAwardsPage } from './pages/admin/Awards';
import { AdminImportPage } from './pages/admin/Import';
import { useAuthStore } from './store/app';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movie/:id" element={<MovieDetail />} />
          <Route path="person/:id" element={<PersonDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="discover" element={<Discover />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="people" element={<AdminPeoplePage />} />
          <Route path="awards" element={<AdminAwardsPage />} />
          <Route path="import" element={<AdminImportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
