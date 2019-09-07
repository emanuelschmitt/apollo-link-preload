import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation
} from 'apollo-link';
import { hasDirectives, removeDirectivesFromDocument } from 'apollo-utilities';
import get from 'gql-get';
import { preloadImage } from './preload-image';
import { DIRECTIVE_NAME, getAnnotatedFieldPaths } from './utilities';

/**
 * Apollo link to preload GraphQL image fields annotated with @preload.
 */
export default class ApolloLinkPreload extends ApolloLink {
  public request(
    operation: Operation,
    forward?: NextLink
  ): Observable<FetchResult> | null {
    const { query } = operation;

    if (!forward) {
      throw new Error('no forward link defined');
    }

    // Check if the directive is available, forward in the chain if possible.
    const hasPreloadAnnotation = hasDirectives([DIRECTIVE_NAME], query);
    if (!hasPreloadAnnotation && typeof forward === 'function') {
      return forward(operation);
    }

    const preloadPaths = getAnnotatedFieldPaths(query);
    const nonPreload = removeDirectivesFromDocument(
      [{ name: DIRECTIVE_NAME }],
      query
    );
    operation.query = nonPreload;

    return forward(operation).flatMap(
      result =>
        new Observable(observer => {
          const imageSources = [];

          for (const path of preloadPaths) {
            const sources = get<string[]>(result.data, path);
            if (Array.isArray(sources)) {
              imageSources.push(...sources);
            } else {
              imageSources.push(sources);
            }
          }

          Promise.all(imageSources.map(preloadImage)).finally(() => {
            observer.next(result);
            observer.complete();
          });
        })
    );
  }
}
