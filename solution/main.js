const fs = require("node:fs");
const path = require("node:path");

/**
 * requirements:
 *  - Node >= 18
 */
class JSONTreeSortion {
  constructor() {}

  /**
   * main sortion method
   * @param {any[]} array unsorted nodes array.
   * @returns {any[]} sorted tree
   */
  sort(array) {
    // refresh new array for an instance when sorting.
    this.array = array;

    // the main array for storing root nodes of the tree.
    const roots = [];
    
    /**
     * firstly adding nodes which haven't
     * any parent and sibling refreneces.
     */
    this.array.forEach((node, id) => {
      if (!node?.parentId && !node?.previousSiblingId) {
        this.array.splice(id, 1);
        node.children = this.#getChilds(node, this.array);
        roots.push(node);
      }
    });

    // counter for the traversing of an input array.
    let i = 0;
    /**
     * here we gonna traverse the entire array
     * untill it has elements.
     * because all elements are moving from 
     * input array to the siblings and childs of siblings
     * of the roots nodes in the @roots array.
     */
    while (this.array.length) {
      // let's take a root elent from the beginning.
      const current_root = roots.at(i);
      i++;
  
      /**
       * getting an element that is the next sibling
       * which refers to the current root.
       */
      const new_root_id = this.array.findIndex(node => {
        return !node.parentId && 
        node?.previousSiblingId === current_root?.nodeId
      });
      const new_root = this.array?.[new_root_id];

      // true if the input array of nodes is empty.
      if (!new_root) return roots;
  
      // getting children for the new root.
      new_root.children = this.#getChilds(new_root, this.array);

      /**
       * the future actual id of the new root
       * in the @roots array that will be putted there.
       */
      const curr_root_actual_id = roots.findIndex(node => {
        return node.nodeId === new_root.previousSiblingId
      }) + 1; 

      // putting new root with children into @roots
      roots.splice(curr_root_actual_id, 0, new_root);
      // removing used node from the input array.
      this.array.splice(new_root_id, 1);
    }
  
    return roots;
  }

  /**
   * gets nodes that is refferencing to the given node.
   * @param {any} node 
   * @returns {any[]} children of the given node.
   */
  #getChilds(node) {
    const children = [];
    const parentId = node.nodeId;

    /**
     * traverse the whole array to find
     * a child of the given node.
     */
    this.array.forEach((child_node, id) => {
      if (child_node.parentId === parentId) {
        const prev_child_id = children.findIndex(
          (cur_node) => cur_node?.nodeId === child_node?.previousSiblingId
        );
        children.splice(prev_child_id + 1, 0, child_node);
        this.array.splice(id, 1);
      }
    });

    // recursively get childs for childs...
    return children.map(node => {
      node.children = this.#getChilds(node);
      return node;
    });
  }
}

/**
 * the main bootstrap function.
 */
function main() {
  /**
   * array of the input and output paths.
   * @example 
   * [
   *  {
   *    input: string;
   *    output: string
   *  }
   * ];
   */
  const in_out_paths = [];
  // fetching files from input directory.
  const uknown_files = fs.readdirSync(path.resolve("input"));
  // initlizing array of paths.
  uknown_files.forEach(file => {
    if (file.endsWith(".json")) {
      const paths = {};
      paths.input = path.resolve("input", file);
      paths.output = path.resolve("output", file);
      in_out_paths.push(paths);
    }
  });

  // PERFORMING TESTS...
  const jsonts = new JSONTreeSortion();

  for (const paths of in_out_paths) {
    const {input, output} = paths;
    console.log(`Testing: ${input}`);
    
    const unsorted_nodes = JSON.parse(fs.readFileSync(input));
    const sorted_nodes = jsonts.sort(unsorted_nodes);
    
    console.log(`Saving result at: ${output}`);
    fs.writeFileSync(
      output,
      JSON.stringify(sorted_nodes, null, '\t')
    );
  }

  console.log(`All tests is done!`);
}

// okaaaaayyy, let's go...
main();
