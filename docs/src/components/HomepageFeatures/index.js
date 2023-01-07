import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Create declarative REST APIs',
    description: (
      <>
        Quickly create REST APIs by adding decorators to your source code. Use typescript interfaces and aliases to
        validate request and response bodies.
      </>
    )
  },
  {
    title: 'Serverless deployment with CDK',
    description: (
      <>Use our CDK construct to automatically generate lambda functions and wire them up to your API Gateway.</>
    )
  },
  {
    title: 'Generate Open API Documentation',
    description: (
      <>
        Generate Open API specifications directly from your code. No need to maintain separate documents. All of your
        code is in one place.
      </>
    )
  }
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
