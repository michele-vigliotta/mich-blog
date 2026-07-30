// il file è .tsx perchè ci consente di usare la sintassi JSX

import Link from 'next/link';
// Post è il nostro tipo
import { Post } from '@/lib/posts';


// Un componente React è una funzione che restituisce del markup. 
// Un componente riceve un solo parametro: un oggetto con tutti i dati che il genitore gli passa. 
// Quando in page.tsx scrivi <PostCard post={post} />, il componente riceve { post: {...} }.
// { post } è il destructuring di quell'oggetto. Estrae il campo post e lo mette in una costante omonima.
// : { post: Post } è il tipo dell'argomento, e va letto: "il parametro è un oggetto che ha un campo post di tipo Post".
//  Le due graffe sembrano ripetute ma dicono cose diverse: la prima destruttura, la seconda tipizza.
// export default perché ogni componente sta nel suo file ed è la cosa principale che quel file esporta.
export default function PostCard({ post }: { post: Post }) {

    // data da anno mese giorno a giorno mese anno
    const [anno, mese, giorno] = post.data.split('-');
    const dataIt = `${giorno}/${mese}/${anno}`;

    return (
        // le graffe delimitano codice js
        // <Link> invece di <a>. Visivamente identici, 
        // ma <a> scarica l'intera pagina da capo, mentre Link intercetta il click e sostituisce solo la parte cambiata, 
        // senza ricaricare. In più Next fa il prefetch: quando la card entra nel campo visivo, 
        // la pagina di destinazione viene scaricata in anticipo, così il click è istantaneo. 
        // Regola: navigazione interna al sito → Link; link verso l'esterno → <a>

        <Link
            href={`/posts/${post.slug}`}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-500">
                {dataIt} · {post.ora} · {post.luogo}
            </p>
            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-800 rounded px-2 py-1">
                {post.tipo}
            </span>
        </Link>
    );
}

