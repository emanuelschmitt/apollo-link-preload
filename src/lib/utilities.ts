import {
  DocumentNode,
  FieldNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode
} from 'graphql';

export const DIRECTIVE_NAME = 'preload';

/**
 * Compose a path with delimiter.
 * @param previous
 * @param current
 */
function composePath(previous: string, current: string): string {
  return previous ? previous + '.' + current : current;
}

/**
 * Checks wether a field has a specific directive annotation for given name.
 * @param fieldNode field node
 * @param directiveName directive name
 */
export function hasDirectiveAnnotation(
  fieldNode: FieldNode,
  directiveName: string
): boolean {
  if (!fieldNode.directives) {
    return false;
  }

  const directive = fieldNode.directives.find(
    node => node.name.value === directiveName
  );
  return Boolean(directive);
}

/**
 * Walks the field node's selection set to collect paths with directive annotations.
 * Paths returned are of following pattern: 'field(.subfield)*.annotatedField'
 * @param selectionSet selection set
 * @param previousPath previous
 */
function walkASTForDirectivePaths(
  selectionSet: readonly SelectionNode[],
  directiveName: string,
  previousPath: string = ''
): string[] {
  return selectionSet.reduce(
    (acc, selectionNode) => {
      // if (!isFieldNode(selectionNode)) {
      //   // We only want to walk the field nodes.
      //   return acc;
      // }
      const fieldNode = selectionNode as FieldNode;

      if (fieldNode.selectionSet) {
        // whenever a field node has a selection set with sub-fields,
        // walk the fields recursively.
        const path = composePath(previousPath, fieldNode.name.value);
        const selections = fieldNode.selectionSet.selections;
        const fields = walkASTForDirectivePaths(
          selections,
          directiveName,
          path
        );
        acc.push(...fields);
      }

      if (hasDirectiveAnnotation(fieldNode, directiveName)) {
        const fieldName = fieldNode.name.value;
        const path = composePath(previousPath, fieldName);
        acc.push(path);
      }

      return acc;
    },
    [] as string[]
  );
}

/**
 * Gets all field node paths with directives used for annotation.
 * @param query document node of query
 */
export function getAnnotatedFieldPaths(
  query: DocumentNode,
  directiveName: string = DIRECTIVE_NAME
): string[] {
  const definitionNode = query.definitions.find(
    node => node.kind === Kind.OPERATION_DEFINITION
  );

  const selectionSet = (definitionNode as OperationDefinitionNode).selectionSet
    .selections;
  return walkASTForDirectivePaths(selectionSet, directiveName);
}
