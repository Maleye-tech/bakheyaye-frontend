import { Link, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import TenueDetail, { TenueModal } from "./pages/TenueDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import AdminLayout from "./admin/AdminLayout";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import TenueForm from "./admin/TenueForm";
import Categories from "./admin/Categories";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-3xl">Page introuvable</p>
      <Link to="/" className="btn btn-gold mt-6">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // Un clic sur une tenue ouvre l'aperçu PAR-DESSUS la page en cours (catalogue, accueil…)
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="tenue/:id" element={<TenueDetail />} />
          <Route path="panier" element={<Cart />} />
          <Route path="favoris" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<TenueForm />} />
          <Route path=":id/edit" element={<TenueForm />} />
          <Route path="categories" element={<Categories />} />
        </Route>
      </Routes>

      {background && (
        <Routes>
          <Route path="tenue/:id" element={<TenueModal />} />
        </Routes>
      )}
    </>
  );
}
