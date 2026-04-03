import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth';
import NotificationSettings from '@/components/ui/NotificationSettings';

export const metadata = {
  title: 'Notificaciones - Anime Fan',
};

export default async function NotificacionesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) redirect('/login');

  const payload = await decrypt(sessionCookie.value);
  if (!payload) redirect('/login');

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Notificaciones</h1>
        <p className="text-gray-400 mb-8">
          Administra tus notificaciones push y preferencias por tipo.
        </p>
        <NotificationSettings />
      </div>
    </div>
  );
}

