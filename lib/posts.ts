import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// variabile che contiene il path della cartella dove pubblico i post
const postsDirectory = path.join(process.cwd(), 'content/posts');

// definito il tipo Post, importabile da altri file grazie a export
export type Post = {
  slug: string;
  title: string;
  data: string;
  ora: string;
  luogo: string;
  tipo: string;
  immagine?: string;
  content: string;
};

// funzione che restituisce array di Post
export function getAllPosts(): Post[] {

  // salvo in filenames l'array dei nomi file che stanno in content/posts
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames
    .filter((filename) => filename.endsWith('.md')) //filter mi prende solo i file che finiscono con .md (solo gli elementi per cui filter da true)

    // map trasforma un elemento in altro
    .map((filename) => {
      
    });

  return posts.sort((a, b) => (a.data < b.data ? 1 : -1));
}

