import axios from 'axios';

import {
  IEpisodeServer,
  IMovieInfo,
  IMovieResult,
  ISearch,
  ISource,
  MovieParser,
  TvType,
} from '../../models';

class ThePirateBay extends MovieParser {
  override readonly name = 'ThePirateBay';
  protected baseUrl: string = 'https://apibay.org';
  protected logo: string =
    'https://media.wired.com/photos/59337016d80dd005b42b20b9/master/pass/picture-49.png';
  protected classPath: string = 'MOVIES.ThePirateBay';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES, TvType.ANIME]);

  async search(query: string, page: number = 1): Promise<ISearch<IMovieResult>> {
    const searchURL = `${this.baseUrl}/q.php?q=${query}&cat=&page=${page}`;

    const searchResult: ISearch<IMovieResult> = {
      currentPage: page,
      results: [],
    };

    try {
      const { data } = await axios.get(searchURL);

      data.forEach((item: any) => {
        const movieResult: IMovieResult = {
          provider: item.name,
          id: item.id,
          title: item.name,
          time: new Date(parseInt(item.added) * 1000).toUTCString(),
          seeders: item.seeders,
          leechers: item.leechers,
          size: this.humanizeSize(item.size),
          magnet: this.formatMagnet(item.info_hash, item.name),
          category: item.category,
          status: item.status,
          mappings: {
            imdb: item.imdb,
          },
        };
        searchResult.results.push(movieResult);
      });
    } catch (err) {
      throw new Error((err as Error).message);
    }

    return searchResult;
  }

  async fetchMediaInfo(mediaId: string): Promise<IMovieInfo> {
    const mediaInfoURL = `${this.baseUrl}/t.php?id=${mediaId}`;

    const mediaInfo: IMovieInfo = {
      id: mediaId,
      title: '',
    };

    try {
      const { data } = await axios.get(mediaInfoURL);

      mediaInfo.id = data.id;
      mediaInfo.title = data.name;
      mediaInfo.magnet = this.formatMagnet(data.info_hash, data.name);
      mediaInfo.seeders = data.seeders;
      mediaInfo.leechers = data.leechers;
      mediaInfo.time = new Date(parseInt(data.added) * 1000).toUTCString();
      mediaInfo.category = data.category;
      mediaInfo.status = data.status;
      mediaInfo.mappings = {
        imdb: data.imdb,
      };
      mediaInfo.size = this.humanizeSize(data.size);
      mediaInfo.description = data.descr;
    } catch (err) {
      throw new Error((err as Error).message);
    }
    return mediaInfo;
  }

  fetchEpisodeSources(hash: string, name: string): Promise<ISource> {
    throw new Error('Method not implemented.');
  }

  fetchEpisodeServers(episodeId: string, ...args: any): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }

  private formatMagnet(infoHash: string, name: string) {
    const trackers = [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.to:2920/announce',
      'udp://tracker.opentrackr.org:1337',
      'udp://tracker.internetwarriors.net:1337/announce',
      'udp://tracker.leechers-paradise.org:6969/announce',
      'udp://tracker.pirateparty.gr:6969/announce',
      'udp://tracker.cyberia.is:6969/announce',
    ];
    const trackersQueryString = `&tr=${trackers.map(encodeURIComponent).join('&tr=')}`;
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackersQueryString}`;
  }

  private humanizeSize = (bytes: number) => {
    const thresh = 1000;
    if (bytes < thresh) {
      return `${bytes} B`;
    }
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (bytes >= thresh);
    return `${bytes.toFixed(1)} ${units[u]}`;
  };
}

(async () => {
  const tpb = new ThePirateBay();
  const search = await tpb.search('the batman');
  const mediaInfo = await tpb.fetchMediaInfo(search.results[0].id);
  console.log(mediaInfo);
})();

export default ThePirateBay;
