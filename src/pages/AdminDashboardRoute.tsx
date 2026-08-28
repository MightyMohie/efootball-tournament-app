import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AdminLayout, LoadingState } from '@/components/AdminLayout';
import DashboardPage from '@/pages/DashboardPage';
import MatchesPage from '@/pages/MatchesPage';
import StandingsPage from '@/pages/StandingsPage';
import ClubsPage from '@/pages/ClubsPage';
import PlayerPortalPage from '@/pages/PlayerPortalPage';
import ModeratorPage from '@/pages/ModeratorPage';

export default function AdminDashboardRoute() {
  const { user, loading } = useAuth();
  const { section } = useParams();

  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;

  const page = (() => {
    switch (section) {
      case undefined:
      case 'dashboard':
        return <DashboardPage />;
      case 'matches':
        return <MatchesPage />;
      case 'standings':
        return <StandingsPage />;
      case 'clubs':
        return <ClubsPage />;
      case 'player':
        return <PlayerPortalPage />;
      case 'moderator':
        return <ModeratorPage />;
      default:
        return <DashboardPage />;
    }
  })();

  return <AdminLayout>{page}</AdminLayout>;
}
