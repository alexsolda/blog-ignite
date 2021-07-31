import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { AiOutlineCalendar } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";

import { dateFormatter } from '../utils/dateFormatter';


import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = async () => {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  return (
      <main className={styles.container}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.content}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div className={styles.infos}>
                <div className={styles.card}>
                  <AiOutlineCalendar />
                  <time>{dateFormatter(post.first_publication_date)}</time>
                </div>
                <div className={styles.card}>
                  <AiOutlineUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {nextPage &&
          <div className={styles.nextPage} onClick={handleLoadMorePosts}>
            Carregar mais posts
          </div>
        }
      </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  ) as PostPagination;

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30 //30 minutes
  };
};
