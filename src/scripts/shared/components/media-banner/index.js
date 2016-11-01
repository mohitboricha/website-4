import React, { Component, PropTypes } from 'react';

// components declaration
import { Link } from 'react-router';
import Loader from '../loader';

// utils declaration
import { preload } from 'pic-loader';
import { delay } from 'delounce';

// styles declaration
import './style.css';
import styles from './style.css.json';

export default class MediaBanner extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    previous: PropTypes.object,
    next: PropTypes.object
  };

  state = {
    isLoading: false
  }

  componentWillReceiveProps(props) {
    if (props.item) {
      if (!this.props.item || this.props.item.id !== props.item.id) {
        this.setState({ isLoading: true });

        const fn = preload(props.item.big_url);
        delay({ fn, time: 200 })
          .then(() => {
            if (this.props.item && this.props.item.id === props.item.id) {
              this.setState({ isLoading: false });
            }
          });
      }
    }
  }

  render() {
    const { isLoading } = this.state;
    const { item, previous, next } = this.props;

    const leftLink = previous ? (
      <Link to={{ pathname: `/media/${previous.id}`, query: { type: previous.type } }}
         className={`${styles.arrow} ${styles.left}`}>
        {'←'}
      </Link>
    ) : null;

    const rightLink = next ? (
      <Link to={{ pathname: `/media/${next.id}`, query: { type: next.type } }}
        className={`${styles.arrow} ${styles.right}`}>
        {'→'}
      </Link>
    ) : null;

    const content = isLoading
      ? <div className={styles.loaderContainer}><Loader white /></div>
      : <img className={styles.banner} src={item.big_url} alt={item.title} />;

    const isVisible = !isLoading && item;
    const originalLink = (
      <a className={styles.originalLink}
         style={{ visibility: isVisible ? 'visible' : 'hidden'}}
         href={isVisible ? item.big_url: ''} target="_blank">
        {'Click to get big version'}
      </a>
    );

    return (
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          {leftLink}
          <div className={styles.bannerContainer}>
            {content}
          </div>
          {rightLink}
          {originalLink}
        </div>
        <div className={`${styles.textContainer} container`}>
          <h2 className={styles.title}>
            {item.title}
          </h2>
          <div className={styles.description}>
            {item.description}
          </div>
        </div>
      </div>
    );
  }
}
