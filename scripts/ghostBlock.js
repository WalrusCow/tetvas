/*******************************************************
 * Ghost block class
 *******************************************************/

function GhostBlock(pt) {
  // It's exactly a normal block, but with a different fill and border
  Block.call(this, pt, GHOST_FILL, GHOST_BORDER_COLOUR);
}
GhostBlock.prototype = Object.create(Block.prototype);
