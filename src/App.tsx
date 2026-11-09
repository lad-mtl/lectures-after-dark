import { useAnalytics } from "./hooks/useAnalytics";
import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { PageHeader } from "./components/PageHeader";
import Home from "./pages/Home";
import { Events, EventDetail } from "./pages/Events";
import { Speakers } from "./pages/Speakers";
import { Topics } from "./pages/Topics";
import { About } from "./pages/About";
import GetInvolved from "./pages/GetInvolved";
import NewsletterStatus from "./pages/NewsletterStatus";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const NewsletterAdmin = lazy(() => import("./pages/NewsletterAdmin"));

export default function App() {
  useAnalytics();
  return (
    <Routes>
      <Route
        path="/newsletter/admin/*"
        element={
          <Suspense fallback={<p>Loading newsletter studio…</p>}>
            <NewsletterAdmin />
          </Suspense>
        }
      />
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="speakers" element={<Speakers />} />
        <Route path="topics" element={<Topics />} />
        <Route path="about" element={<About />} />
        <Route path="about-us" element={<Navigate to="/about" replace />} />
        <Route
          path="privacy-policy"
          element={<Navigate to="/privacy" replace />}
        />
        <Route
          path="get-involved"
          element={<Navigate to="/get-involved/speaker" replace />}
        />
        <Route path="get-involved/:kind" element={<GetInvolved />} />

        <Route
          path="venue"
          element={<Navigate to="/get-involved/venue" replace />}
        />

        <Route path="newsletter" element={<NewsletterStatus />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route
          path="*"
          element={
            <div className="lad-container">
              <PageHeader eyebrow="LECTURES AFTER DARK" title="Page not found.">
                Explore the events, speakers, and ideas from the navigation
                above.
              </PageHeader>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
