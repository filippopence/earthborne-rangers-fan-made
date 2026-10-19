import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import {useAdventures} from '@site/src/data/useAdventure';

function AdventureCard({slug, adventure}) {
  const cover = useBaseUrl(`/cards/${slug}/${adventure.cardFolder}${adventure.cards[0].front.file}`);
  return (
    <div className="col col--6 margin-bottom--lg">
      <div className="card">
        <div className="card__body">
          <div className="row">
            <div className="col col--4">
              <img src={cover} alt="" style={{borderRadius: 8}} />
            </div>
            <div className="col col--8">
              <Heading as="h2">{adventure.title}</Heading>
              <p>{adventure.summary}</p>
            </div>
          </div>
        </div>
        <div className="card__footer">
          <div className="button-group button-group--block">
            <Link className="button button--primary" to={`/docs/${slug}`}>
              <Translate id="home.readGuide">Read the guide</Translate>
            </Link>
            <Link className="button button--outline button--primary" to={`/docs/${slug}/download`}>
              <Translate id="home.download">Download &amp; print</Translate>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <header className="hero hero--primary">
        <div className="container">
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle">
            <Translate id="home.tagline">
              {'Unofficial fan-made adventures for Earthborne Rangers, by Filippo "Pence"'}
            </Translate>
          </p>
        </div>
      </header>
      <main className="container margin-vert--lg">
        <div className="row">
          {useAdventures().map(([slug, adventure]) => (
            <AdventureCard key={slug} slug={slug} adventure={adventure} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
