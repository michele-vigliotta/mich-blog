// il file è .tsx perchè ci consente di usare la sintassi JSX

import Link from 'next/link';
// Post è il nostro tipo
import { Post } from '@/lib/posts'; 


// Un componente React è una funzione che restituisce del markup. Il nome deve iniziare con la maiuscola — è così che React distingue <PostCard /> (tuo componente) da <div /> (tag HTML).
// Un componente riceve un solo parametro: un oggetto con tutti i dati che il genitore gli passa. 
// Quando in page.tsx scrivi <PostCard post={post} />, il componente riceve { post: {...} }.
// { post } è il destructuring di quell'oggetto. Estrae il campo post e lo mette in una costante omonima.
// : { post: Post } è il tipo dell'argomento, e va letto: "il parametro è un oggetto che ha un campo post di tipo Post".
//  Le due graffe sembrano ripetute ma dicono cose diverse: la prima destruttura, la seconda tipizza.
// export default perché ogni componente sta nel suo file ed è la cosa principale che quel file esporta.
export default function PostCard({ post }: { post: Post }) {