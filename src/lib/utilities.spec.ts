import { Kind } from 'graphql';
import gql from 'graphql-tag';
import { getAnnotatedFieldPaths, hasDirectiveAnnotation } from './utilities';

describe('hasDirectiveAnnotation', () => {
  test('should return false when no directives are available', () => {
    expect(
      hasDirectiveAnnotation(
        {
          directives: undefined,
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: 'name'
          }
        },
        'test'
      )
    ).toBeFalsy();
  });

  test('should return false when no directives are available', () => {
    expect(
      hasDirectiveAnnotation(
        {
          directives: [
            {
              kind: Kind.DIRECTIVE,
              name: {
                kind: Kind.NAME,
                value: 'directive'
              }
            }
          ],
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: 'name'
          }
        },
        'test'
      )
    ).toBeFalsy();
  });
});

describe('getAnnotatedFieldPaths', () => {
  test('should get annotated paths', () => {
    const query = gql`
      {
        model {
          test @preload
          another {
            url @preload
          }
          non
        }
      }
    `;

    const result = getAnnotatedFieldPaths(query, 'preload');
    expect(result).toEqual(['model.test', 'model.another.url']);
  });

  test('should return no paths on unannotated query', () => {
    const query = gql`
      {
        model {
          test
        }
      }
    `;

    const result = getAnnotatedFieldPaths(query, 'preload');
    expect(result).toEqual([]);
  });
});
