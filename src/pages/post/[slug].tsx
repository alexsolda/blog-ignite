import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import Prismic from '@prismicio/client';

import { AiOutlineCalendar } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { BiTime } from 'react-icons/bi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { dateFormatter } from '../../utils/dateFormatter';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter();

  if(router.isFallback) {
    return <p>Carregando...</p>
  }

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const readWordsPerMinute = 200;
    let fullContentText = '';
    
    post.data.content.forEach(postContent => {
      fullContentText += postContent.heading;
      fullContentText += RichText.asText(postContent.body);
    });

    const time = Math.ceil(fullContentText.split(/\s/g).length / readWordsPerMinute);

    return time;
  }, [post, router.isFallback]);

  return (
    <article className={styles.container}>
      <header>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </div>
        <h1>{post.data.title}</h1>
        <div className={styles.infos}>
          <div className={styles.cardInfo}>
            <AiOutlineCalendar />
            <time>{dateFormatter(post.first_publication_date)}</time>
          </div>
          <div className={styles.cardInfo}>
            <AiOutlineUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.cardInfo}>
            <BiTime />
            <span>{readTime} min</span>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {post.data.content.map(content => (
          <div key={content.heading}>
            <h2>{content.heading}</h2>
            <div className={styles.bodyContent} dangerouslySetInnerHTML={{
              __html: RichText.asHtml(content.body)
            }} />
          </div>
        ))}
      </main>

    </article>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([Prismic.predicates.at('document.type', 'posts')]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response
    },
    revalidate: 60 * 5 //5 minutes
  }

};
