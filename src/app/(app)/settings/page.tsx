import Header from '@/components/layout/header';
import { getProfile } from '@/services/data';
import SettingsClient from './settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <>
      <Header title="Settings" />
      <SettingsClient profile={profile} />
    </>
  );
}
