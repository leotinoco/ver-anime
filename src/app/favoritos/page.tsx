import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { FavoriteList } from "@/models/FavoriteList";
import { ListVideo } from "lucide-react";
import CreateListModal from "@/components/ui/CreateListModal";
import FavoritesListsClient from "@/components/favorites/FavoritesListsClient";

export const metadata = {
  title: "Mi Lista - Anime Fan",
};

export default async function FavoritosPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const payload = await decrypt(sessionCookie.value);
  if (!payload) {
    redirect("/login");
  }

  // Fetch real data from MongoDB
  await connectDB();
  
  // Fetch lists and convert MongoDB objects to plain items for client components
  const listsData = await FavoriteList.find({
    userId: payload.userId,
  }).lean();

  const userLists = listsData.map((list: any) => ({
    _id: list._id.toString(),
    name: list.name,
    animes: list.animes.map((anime: any) => ({
      ...anime,
      _id: anime._id?.toString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              <ListVideo className="w-8 h-8 text-primary" /> Mis Listas
            </h1>
            <p className="text-gray-400">
              Organiza tus animes favoritos. Puedes crear hasta 3 listas
              personalizadas y arrastrar animes para moverlos entre ellas.
            </p>
          </div>

          <CreateListModal
            currentListCount={userLists.length}
            variant="header"
          />
        </div>

        {userLists && userLists.length > 0 ? (
          <FavoritesListsClient initialLists={userLists} />
        ) : (
          <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <ListVideo className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">
              No tienes listas creadas
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Comienza a guardar tus animes favoritos para tenerlos siempre
              organizados.
            </p>
            <CreateListModal currentListCount={0} variant="empty" />
          </div>
        )}
      </div>
    </div>
  );
}
