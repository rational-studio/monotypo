import * as assert from 'assert';

export interface GraphNode {
  name: string;
  dependencies: GraphNode[];
}

function deepCopyGraphNode<T extends GraphNode>(
  entryPoint: T
): [deepCopy: GraphNode, newOldMap: Map<GraphNode, T>] {
  const oldNewMap: Map<T, GraphNode> = new Map();
  const newOldMap: Map<GraphNode, T> = new Map();

  function deepCopy(node: T) {
    const copy = oldNewMap.get(node);
    if (copy) {
      return copy;
    } else {
      const { dependencies: oldDependencies, name } = node;
      const newCopy: GraphNode = {
        name,
        dependencies: oldDependencies.map(item => deepCopy(item as T)),
      };
      oldNewMap.set(node, newCopy);
      newOldMap.set(newCopy, node);
      return newCopy;
    }
  }

  deepCopy(entryPoint);

  const newEntryPoint = oldNewMap.get(entryPoint);

  assert(newEntryPoint, 'Unable to deep copy this GraphNode.');

  return [newEntryPoint, newOldMap];
}

function findZeroDependencyItem(
  node: GraphNode,
  iterationResult: Set<GraphNode>
) {
  if (node.dependencies.length > 0) {
    node.dependencies.forEach(item =>
      findZeroDependencyItem(item, iterationResult)
    );
  } else {
    iterationResult.add(node);
  }
}

function removeItemFromDependencyList(
  entryPoint: GraphNode,
  nodes: GraphNode[]
) {
  function removeItemFromNode(node: GraphNode) {
    node.dependencies.forEach(child => removeItemFromNode(child));
    node.dependencies = node.dependencies.filter(
      child => !nodes.includes(child)
    );
  }
  removeItemFromNode(entryPoint);
}

/**
 * @description
 * Given a dependency graph with entrypoints, return an array of grouped tasks that can run in parallel.
 * @param entryPoints
 * @returns
 */
export function parallelizeTasks<T extends GraphNode>(
  ...entryPoints: T[]
): T[][] {
  /**
   * For the explaination of this algorithm for single entry point, please check `_paralleliseTasks`.
   */
  if (entryPoints.length === 1) {
    return _parallelizeTasks(entryPoints[0]);
  } else {
    const FAUX_ENTRY_POINT_NAME = '%%FAUX_ENTRY_POINT%%';
    const fauxEntryPoint: GraphNode = {
      name: FAUX_ENTRY_POINT_NAME,
      dependencies: entryPoints,
    };
    const result = _parallelizeTasks(fauxEntryPoint);

    // Remove the faux entry point from the array
    const fauxEntryPointArray = result.pop();
    assert(
      fauxEntryPointArray &&
        fauxEntryPointArray[0] &&
        fauxEntryPointArray[0].name === FAUX_ENTRY_POINT_NAME,
      'Error removing the faux entry point'
    );
    return result as T[][];
  }
}

export function _parallelizeTasks<T extends GraphNode>(entryPoint: T): T[][] {
  /*
   *           A
   *         /- -\
   *        -     --
   *       B        C
   *     /---\    /--\
   *    -     ----    --
   *     F      D      /E
   *                  / -\
   *                 -    -
   *                 G     H
   *
   * Provided above dependency graph, if the entry point is A, we do DFS to the graph to find nodes that has 0 dependencies.
   * (For the first iteration, we can find F D G H has 0 deps) Put them in an array and remove them from the graph.
   * And we start over again (since we removed some nodes in last iteration, there must be new nodes with 0 deps.) until
   * there's only the entry point (A in this case) left. In the end we push the entry point into the array.
   *
   * The dependency graph must be acyclic, i.e a polytree. Otherwise, the algorithm will throw an error if circular dependency is found.
   *
   * So for the graph above we get the following result:
   * [
   *  [F, D, G, H],
   *  [B, E],
   *  [C],
   *  [A]
   * ]
   *
   * Meaning F,D,G,H could execute concurrently, then B and E, then C, finally A.
   * This algorithm does not and won't take concurrency throttling into account. Please use libary `p-limit` for this case.
   *
   * P.S: The granularity of this method is still not fine enough. Later the event-driven concurrency model will be introduced and used together
   * with this function
   */
  const result: GraphNode[][] = [];

  const [entryPointCopy, newOldMap] = deepCopyGraphNode(entryPoint);

  while (entryPointCopy.dependencies.length > 0) {
    const iteration: Set<GraphNode> = new Set();
    findZeroDependencyItem(entryPointCopy, iteration);
    const zeroDependencyArray = Array.from(iteration);
    assert(
      zeroDependencyArray.length > 0,
      'Encountered a cycle in the dependency graph.'
    );
    result.push(zeroDependencyArray);
    removeItemFromDependencyList(entryPointCopy, zeroDependencyArray);
  }

  // TODO: Double-check if entryPointCopy has already been added to the graph
  result.push([entryPointCopy]);

  // Since the result is the deeply-copied version. We need to find
  // the original copy of objects
  return result.map(nodes =>
    nodes.map(node => {
      const original = newOldMap.get(node);
      assert(original, 'Unable to find the original copy of the node.');
      return original;
    })
  );
}
