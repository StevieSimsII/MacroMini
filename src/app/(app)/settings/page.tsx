import Header from '@/components/layout/header';
import { getProfile } from '@/services/data';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <>
      <Header title="Settings" />
      <SettingsClient profile={profile} />
    </>
  );
}
