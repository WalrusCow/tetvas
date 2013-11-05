/*******************************************************
 * Ghost block class - to override some colours
 *******************************************************/

define(['blocks/block'], function(Block) {

  var GHOST_BORDER_COLOUR = '#FFFFFF';
  var GHOST_FILL = '#C3C3C3';

  function GhostBlock(pt) {
    // It's exactly a normal block, but with a different fill and border
    Block.call(this, pt, GHOST_FILL, GHOST_BORDER_COLOUR);
  }
  GhostBlock.prototype = Object.create(Block.prototype);

  return GhostBlock;
});
