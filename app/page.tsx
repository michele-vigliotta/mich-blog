import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default function HomePage() {

  // const posts = getAllPosts() legge file dal disco dentro un componente, con una chiamata sincrona e diretta. 
  // Niente useEffect, niente fetch, niente API, nessuno stato di caricamento.
  // È possibile perché nell'App Router i componenti sono Server Component di default: 
  // girano su Node durante il build, e al browser arriva solo l'HTML finito. 
  // Il tuo posts.ts con fs non viene mai spedito al client — non fa proprio parte del bundle JavaScript.
  // Nel React "classico" lo stesso risultato richiedeva: un endpoint API, un fetch dal browser, uno stato loading, 
  // uno stato error, e un flash di pagina vuota al primo caricamento. Qui il visitatore riceve HTML già pronto.
  // Finché non scrivi 'use client' in cima a un file, quel codice non arriva mai al browser. 
  // Il giorno che ti servirà interattività (un filtro per tipo di allenamento, per dire) metterai 'use client' su quel componente lì,
  //  e solo quello finirà nel bundle.
  const posts = getAllPosts();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Mich Posts</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          // key serve a React per capire quando la lista cambia e cosa deve ridisegnare
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}