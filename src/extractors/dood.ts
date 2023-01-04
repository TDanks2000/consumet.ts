import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
import { USER_AGENT } from '../utils';
import { Console } from 'console';

/**
 * work in progress
 */
class Dood extends VideoExtractor {
  protected override serverName = 'Dood';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://dood.wf/';

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    const options = {
      headers: {
        'User-Agent': USER_AGENT,
      },
    };

    try {
      const response = await axios.get(`${videoUrl.href}`, options);
    } catch (err) {
      console.log(err);
      throw new Error((err as Error).message);
    }

    return this.sources;
  };
}

(async () => {
  const dood = new Dood();
  const url = new URL('https://dood.wf/e/ext0nv8sevophp2xposyvqj4al83e4p');
  const sources = await dood.extract(url);
  console.log(sources);
})();

export default Dood;
