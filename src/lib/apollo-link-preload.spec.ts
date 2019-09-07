import { ApolloLink, execute, Observable } from 'apollo-link';
import gql from 'graphql-tag';
import ApolloLinkPreload from './apollo-link-preload';
import { preloadImage } from './preload-image';

jest.mock('./preload-image', () => ({
  preloadImage: jest.fn((src: string) => Promise.resolve(src))
}));
const preloadImageMock = preloadImage as jest.MockedFunction<
  typeof preloadImage
>;

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

describe('ApolloLinkPreload', () => {
  test('should abort if no forward function is passed', () => {
    const preloadLink = new ApolloLinkPreload();
    const query = gql`
      query resourceQuery($url: String!) {
        resourceQuery {
          image @preload
        }
      }
    `;

    try {
      execute(preloadLink, { query });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  test('should resolve non-annotated query', done => {
    const preloadLink = new ApolloLinkPreload();
    const query = gql`
      query resourceQuery($url: String!) {
        resourceQuery {
          image
        }
      }
    `;

    const exampleUrl = 'https://test';
    const responseData = { resourceQuery: { image: exampleUrl } };
    const nextLink = new ApolloLink(() => {
      return Observable.of({
        data: responseData
      });
    });

    execute(preloadLink.concat(nextLink), { query }).subscribe(result => {
      try {
        expect(result.data).toEqual(responseData);
      } catch (err) {
        done.fail(err);
      }
      done();
    }, done.fail);
  });

  test('should resolve @preload directive and preload image', done => {
    const preloadLink = new ApolloLinkPreload();
    const query = gql`
      query resourceQuery($url: String!) {
        resourceQuery {
          image @preload
        }
      }
    `;

    const exampleUrl = 'https://test';
    const responseData = { resourceQuery: { image: exampleUrl } };
    const nextLink = new ApolloLink(() => {
      return Observable.of({
        data: responseData
      });
    });

    execute(preloadLink.concat(nextLink), { query }).subscribe(result => {
      try {
        expect(preloadImageMock).toHaveBeenCalled();
        expect(preloadImageMock).toHaveBeenCalledTimes(1);
        expect(preloadImageMock.mock.calls[0][0]).toEqual(exampleUrl);

        expect(result.data).toEqual(responseData);
      } catch (err) {
        done.fail(err);
      }
      done();
    }, done.fail);
  });

  test('should resolve @preload directive and preload nested image sources', done => {
    const preloadLink = new ApolloLinkPreload();
    const query = gql`
      query resourceQuery($url: String!) {
        resourceQuery {
          image @preload
        }
      }
    `;

    const exampleUrls = ['https://test', 'https://test2'];
    const responseData = {
      resourceQuery: [{ image: exampleUrls[0] }, { image: exampleUrls[1] }]
    };
    const nextLink = new ApolloLink(() => {
      return Observable.of({
        data: responseData
      });
    });

    execute(preloadLink.concat(nextLink), { query }).subscribe(result => {
      try {
        expect(preloadImageMock).toHaveBeenCalled();
        expect(preloadImageMock).toHaveBeenCalledTimes(2);
        expect(preloadImageMock.mock.calls[0][0]).toEqual(exampleUrls[0]);
        expect(preloadImageMock.mock.calls[1][0]).toEqual(exampleUrls[1]);

        expect(result.data).toEqual(responseData);
      } catch (err) {
        done.fail(err);
      }
      done();
    }, done.fail);
  });

  test('should not preload if no @preload directive is added', done => {
    const preloadLink = new ApolloLinkPreload();
    const query = gql`
      query resourceQuery($url: String!) {
        resourceQuery {
          image
        }
      }
    `;

    const responseData = { test: 'hello' };
    const nextLink = new ApolloLink(() => {
      return Observable.of({
        data: responseData
      });
    });

    execute(preloadLink.concat(nextLink), { query }).subscribe(result => {
      try {
        expect(preloadImage).toHaveBeenCalledTimes(0);
        expect(result.data).toEqual(responseData);
      } catch (err) {
        done.fail(err);
      }
      done();
    }, done.fail);
  });
});
